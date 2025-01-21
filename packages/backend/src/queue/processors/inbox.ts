import { URL } from "node:url";
import Bull from "bull";
import httpSignature from "@peertube/http-signature";
import perform from "@/remote/activitypub/perform.js";
import Logger from "@/services/logger.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import { Instances } from "@/models/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { toPuny, extractDbHost } from "@/misc/convert-host.js";
import { getApId } from "@/remote/activitypub/type.js";
import { fetchInstanceMetadata } from "@/services/fetch-instance-metadata.js";
import DbResolver from "@/remote/activitypub/db-resolver.js";
import { StatusError } from "@/misc/fetch.js";
import { CacheableRemoteUser } from "@/models/entities/user.js";
import { UserPublickey } from "@/models/entities/user-publickey.js";
import { InboxJobData } from "../types.js";

const logger = new Logger("inbox");

// ユーザーのinboxにアクティビティが届いた時の処理
export default async (job: Bull.Job<InboxJobData>): Promise<string> => {
    const signature = job.data.signature;	// HTTP-signature
    const activity = job.data.activity;

    //#region Log
    const info = Object.assign({}, activity) as any;
    delete info["@context"];
    logger.debug(JSON.stringify(info, null, 2));
    //#endregion

    const host = toPuny(new URL(signature.keyId).hostname);

    // ブロックしてたら中断
    const meta = await fetchMeta();
    if (meta.blockedHosts.some(x => host.endsWith(x))) {
        return `Blocked request: ${host}`;
    }

    const keyIdLower = signature.keyId.toLowerCase();
    if (keyIdLower.startsWith("acct:")) {
        return `Old keyId is no longer supported. ${keyIdLower}`;
    }

    const dbResolver = new DbResolver();

    // HTTP-Signature keyIdを元にDBから取得
    let authUser: {
				user: CacheableRemoteUser;
				key: UserPublickey | null;
		} | null = await dbResolver.getAuthUserFromKeyId(signature.keyId);

    // keyIdでわからなければ、activity.actorを元にDBから取得 || activity.actorを元にリモートから取得
    if (authUser == null) {
        try {
            authUser = await dbResolver.getAuthUserFromApId(getApId(activity.actor));
        } catch (e) {
            // 対象が4xxならスキップ
            if (e instanceof StatusError) {
                if (e.isClientError) {
                    return `skip: Ignored deleted actors on both ends ${activity.actor} - ${e.statusCode}`;
                }
                throw `Error in actor ${activity.actor} - ${e.statusCode || e}`;
            }
        }
    }

    // それでもわからなければ終了
    if (authUser == null) {
        return "skip: failed to resolve user";
    }

    // publicKey がなくても終了
    if (authUser.key == null) {
        return "skip: failed to resolve user publicKey";
    }

    // HTTP-Signatureの検証
    const httpSignatureValidated = httpSignature.verifySignature(signature, authUser.key.keyPem);

    // また、signatureのsignerは、activity.actorと一致する必要がある
    if (!httpSignatureValidated || authUser.user.uri !== activity.actor) {
        return `skip: http-signature verification failed. keyId=${signature.keyId}`;
    }

    // activity.idがあればホストが署名者のホストであることを確認する
    if (typeof activity.id !== "string") {
        return "skip: activity.id is not a string";
    }
    const signerHost = extractDbHost(authUser.user.uri!);
    const activityIdHost = extractDbHost(activity.id);
    if (signerHost !== activityIdHost) {
        return `skip: signerHost(${signerHost}) !== activity.id host(${activityIdHost})`;
    }

    // Update stats
    registerOrFetchInstanceDoc(authUser.user.host).then(i => {
        Instances.update(i.id, {
            latestRequestReceivedAt: new Date(),
            lastCommunicatedAt: new Date(),
            isNotResponding: false,
            isSuspended: false,
        });

        // 配送を停止していてもアクティビティ受信したら配送再開する

        fetchInstanceMetadata(i);
    });

    // アクティビティを処理
    await perform(authUser.user, activity);
    return "ok";
};
