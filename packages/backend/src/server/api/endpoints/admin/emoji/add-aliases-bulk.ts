import { In } from "typeorm";
import { Emojis } from "@/models/index.js";
import { db } from "@/db/postgre.js";
import define from "../../../define.js";
import { ApiError } from "../../../error.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        ids: { type: "array", items: {
            type: "string", format: "misskey:id",
        } },
        aliases: { type: "array", items: {
            type: "string",
        } },
    },
    required: ["ids", "aliases"],
} as const;

export default define(meta, paramDef, async (ps) => {
    const emojis = await Emojis.findBy({
        id: In(ps.ids),
    });

    for (const emoji of emojis) {
        await Emojis.update(emoji.id, {
            updatedAt: new Date(),
            aliases: [...new Set(emoji.aliases.concat(ps.aliases))],
        });
    }

    await db.queryResultCache!.remove(["meta_emojis"]);
});
