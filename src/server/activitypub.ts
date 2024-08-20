import * as crypto from "crypto";
import Router from "@koa/router";
import * as coBody from "co-body";
import httpSignature from "@peertube/http-signature";

import { In, IsNull, Not } from "typeorm";
import config from "@/config/index.js";
import { apLogger } from "@/remote/activitypub/logger.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import renderNote from "@/remote/activitypub/renderer/note.js";
import renderKey from "@/remote/activitypub/renderer/key.js";
import { renderPerson } from "@/remote/activitypub/renderer/person.js";
import renderEmoji from "@/remote/activitypub/renderer/emoji.js";
import { inbox as processInbox } from "@/queue/index.js";
import { isSelfHost } from "@/misc/convert-host.js";
import { Notes, Users, Emojis, NoteReactions } from "@/models/index.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { renderLike } from "@/remote/activitypub/renderer/like.js";
import { getUserKeypair } from "@/misc/keypair-store.js";
import renderFollow from "@/remote/activitypub/renderer/follow.js";
import { IActivity } from "@/remote/activitypub/type.js";
import Featured from "./activitypub/featured.js";
import Following from "./activitypub/following.js";
import Followers from "./activitypub/followers.js";
import Outbox, { packActivity } from "./activitypub/outbox.js";

const logger = apLogger;

// Init router
const router = new Router();

//#region Routing

async function inbox(ctx: Router.RouterContext) {
    // 署名の検証
    // referenced: https://github.com/mei23/misskey/pull/4749
    const { parsed, raw } = await coBody.json(ctx, {
        limit: "64kb",
        returnRawBody: true,
    });
    ctx.request.body = parsed;

    if (raw == null) {
        ctx.status = 400;
        return;
    }

    let signature: httpSignature.IParsedSignature;

    try {
        signature = httpSignature.parseRequest(ctx.req, { "headers": ["(request-target)", "digest", "host", "date"] });
    } catch (e) {
        logger.warn("inbox: signature parse error");
        ctx.status = 401;

        if (e instanceof Error) {
            if (e.name === "ExpiredRequestError") ctx.message = "Expired Request Error";
            if (e.name === "MissingHeaderError") ctx.message = "Missing Required Header";
        }

        return;
    }

    // Validate signature algorithm
    if (!signature.algorithm.toLowerCase().match(/^((dsa|rsa|ecdsa)-(sha256|sha384|sha512)|ed25519-sha512|hs2019)$/)) {
        logger.warn(`inbox: invalid signature algorithm ${signature.algorithm}`);
        ctx.status = 401;
        ctx.message = "Invalid Signature Algorithm";
        return;

        // hs2019
        // keyType=ED25519 => ed25519-sha512
        // keyType=other => (keyType)-sha256
    }

    // Digestヘッダーの検証
    const digest = ctx.req.headers.digest;
    if (typeof digest !== "string") {
        //logger.warn("Invalid digest (not string)")
        ctx.status = 401;
        return;
    }

    const match = digest.match(/^([0-9A-Za-z-]+)=(.+)$/);

    if (match == null) {
        logger.warn("Invalid digest (match == null)");
        ctx.status = 401;
        return;
    }

    const digestAlgo = match[1];
    const digestExpected = match[2];

    if (digestAlgo.toUpperCase() !== "SHA-256") {
        // アルゴリズムをサポートしていない
        logger.warn("digestAlgo is not supported");
        ctx.status = 401;
        return;
    }

    const digestActual = crypto.createHash("sha256").update(raw).digest("base64");

    if (digestExpected !== digestActual) {
        // 不正なダイジェスト
        logger.warn("Invalid digest (digestExpected !== digestActual)");
        ctx.status = 401;
        return;
    }

    if (!signature.params.headers.includes("host") || ctx.headers.host !== config.host) {
        // Host not specified or not match.
        logger.warn("Invalid host header");
        ctx.status = 400;
        return;
    }

    const activity = ctx.request.body as IActivity;
    processInbox(activity, signature);

    ctx.status = 202;
}

const ACTIVITY_JSON = "application/activity+json; charset=utf-8";
const LD_JSON = "application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"; charset=utf-8";

function isActivityPubReq(ctx: Router.RouterContext) {
    ctx.response.vary("Accept");
    const accepted = ctx.accepts("html", ACTIVITY_JSON, LD_JSON);
    return typeof accepted === "string" && !accepted.match(/html/);
}

export function setResponseType(ctx: Router.RouterContext) {
    const accept = ctx.accepts(ACTIVITY_JSON, LD_JSON);
    if (accept === LD_JSON) {
        ctx.response.type = LD_JSON;
    } else {
        ctx.response.type = ACTIVITY_JSON;
    }
}

// inbox
router.post("/inbox", inbox);
router.post("/users/:user/inbox", inbox);

// note
router.get("/notes/:note", async (ctx, next) => {
    if (!isActivityPubReq(ctx)) return await next();

    const note = await Notes.findOneBy({
        id: ctx.params.note,
        visibility: In(["public" as const, "home" as const]),
        localOnly: false,
    });

    if (note == null) {
        ctx.status = 404;
        return;
    }

    // リモートだったらリダイレクト
    if (note.userHost != null) {
        if (note.uri == null || isSelfHost(note.userHost)) {
            ctx.status = 500;
            return;
        }
        ctx.redirect(note.uri);
        return;
    }

    ctx.body = renderActivity(await renderNote(note, false));
    ctx.set("Cache-Control", "public, max-age=180");
    setResponseType(ctx);
});

// note activity
router.get("/notes/:note/activity", async ctx => {
    const note = await Notes.findOneBy({
        id: ctx.params.note,
        userHost: IsNull(),
        visibility: In(["public" as const, "home" as const]),
        localOnly: false,
    });

    if (note == null) {
        ctx.status = 404;
        return;
    }

    ctx.body = renderActivity(await packActivity(note));
    ctx.set("Cache-Control", "public, max-age=180");
    setResponseType(ctx);
});

// outbox
router.get("/users/:user/outbox", Outbox);

// followers
router.get("/users/:user/followers", Followers);

// following
router.get("/users/:user/following", Following);

// featured
router.get("/users/:user/collections/featured", Featured);

// publickey
router.get("/users/:user/publickey", async ctx => {
    const userId = ctx.params.user;

    const user = await Users.findOneBy({
        id: userId,
        host: IsNull(),
    });

    if (user == null) {
        ctx.status = 404;
        return;
    }

    const keypair = await getUserKeypair(user.id);

    if (Users.isLocalUser(user)) {
        ctx.body = renderActivity(renderKey(user, keypair));
        ctx.set("Cache-Control", "public, max-age=180");
        setResponseType(ctx);
    } else {
        ctx.status = 400;
    }
});

// user
async function userInfo(ctx: Router.RouterContext, user: User | null) {
    if (user == null) {
        ctx.status = 404;
        return;
    }

    ctx.body = renderActivity(await renderPerson(user as ILocalUser));
    ctx.set("Cache-Control", "public, max-age=180");
    setResponseType(ctx);
}

router.get("/users/:user", async (ctx, next) => {
    if (!isActivityPubReq(ctx)) return await next();

    const userId = ctx.params.user;

    const user = await Users.findOneBy({
        id: userId,
        host: IsNull(),
        isSuspended: false,
    });

    await userInfo(ctx, user);
});

router.get("/@:user", async (ctx, next) => {
    if (!isActivityPubReq(ctx)) return await next();

    const user = await Users.findOneBy({
        usernameLower: ctx.params.user.toLowerCase(),
        host: IsNull(),
        isSuspended: false,
    });

    await userInfo(ctx, user);
});
//#endregion

// emoji
router.get("/emojis/:emoji", async ctx => {
    const emoji = await Emojis.findOneBy({
        host: IsNull(),
        name: ctx.params.emoji,
    });

    if (emoji == null) {
        ctx.status = 404;
        return;
    }

    ctx.body = renderActivity(await renderEmoji(emoji));
    ctx.set("Cache-Control", "public, max-age=180");
    setResponseType(ctx);
});

// like
router.get("/likes/:like", async ctx => {
    const reaction = await NoteReactions.findOneBy({ id: ctx.params.like });

    if (reaction == null) {
        ctx.status = 404;
        return;
    }

    const note = await Notes.findOneBy({ id: reaction.noteId });

    if (note == null) {
        ctx.status = 404;
        return;
    }

    ctx.body = renderActivity(await renderLike(reaction, note));
    ctx.set("Cache-Control", "public, max-age=180");
    setResponseType(ctx);
});

// follow
router.get("/follows/:follower/:followee", async ctx => {
    // This may be used before the follow is completed, so we do not
    // check if the following exists.

    const [follower, followee] = await Promise.all([
        Users.findOneBy({
            id: ctx.params.follower,
            host: IsNull(),
        }),
        Users.findOneBy({
            id: ctx.params.followee,
            host: Not(IsNull()),
        }),
    ]);

    if (follower == null || followee == null) {
        ctx.status = 404;
        return;
    }

    ctx.body = renderActivity(renderFollow(follower, followee));
    ctx.set("Cache-Control", "public, max-age=180");
    setResponseType(ctx);
});

export default router;
