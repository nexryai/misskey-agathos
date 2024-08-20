import { getApLock } from "@/misc/app-lock.js";
import { extractDbHost } from "@/misc/convert-host.js";
import { Notes } from "@/models/index.js";
import { IRemoteUser } from "@/models/entities/user.js";
import { publishNoteStream } from "@/services/stream.js";
import DbResolver from "@/remote/activitypub/db-resolver.js";
import { apLogger } from "../../logger.js";
import { htmlToMfm } from "../../misc/html-to-mfm.js";
import { IPost, getApId } from "../../type.js";

const logger = apLogger;

export default async function(actor: IRemoteUser, note: IPost): Promise<string> {
    if (typeof note.id !== "string") return "skip";

    // Note.attributedToは署名と同じである必要がある
    if (actor.uri !== note.attributedTo) {
        return "skip: actor.uri !== note.attributedTo";
    }

    // Note.idのホストは署名と同一である必要がある
    if (extractDbHost(note.id) !== extractDbHost(actor.uri)) {
        return "skip: host in actor.uri !== host in note.id";
    }

    const uri = getApId(note);

    logger.info(`Update the Note: ${uri}`);

    const unlock = await getApLock(uri);

    try {
        const dbResolver = new DbResolver();

        // 元ノート照合
        const origin = await dbResolver.getNoteFromApId(uri);
        if (!origin) return "skip: old note is not found";

        // 同じユーザーである必要がある
        if (!(origin.userId === actor.id)) {
            return "投稿をUpdateしようとしているユーザーは投稿の作成者ではありません";
        }

        // validateはinboxのハードリミットでいい

        // テキストのパース
        const cw = note.summary === "" ? null : note.summary;
        let text: string | null = null;
        if (note.source?.mediaType === "text/x.misskeymarkdown" && typeof note.source.content === "string") {
            text = note.source.content;
        } else if (typeof note._misskey_content !== "undefined") {
            text = note._misskey_content;
        } else if (typeof note.content === "string") {
            text = htmlToMfm(note.content, note.tag);
        }

        // Update
        const updates = {
            updatedAt: new Date(),
            text: text?.trim(),
            cw: cw ?? null,
        };

        await Notes.update({ id: origin.id }, updates);

        // Publish to streaming
        publishNoteStream(origin.id, "updated", updates);

        return "ok";
    } finally {
        unlock();
    }
}
