import { IsNull } from "typeorm";
import { Emojis } from "@/models/index.js";
import { db } from "@/db/postgre.js";
import define from "../../../define.js";
import { ApiError } from "../../../error.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,

    errors: {
        noSuchEmoji: {
            message: "No such emoji.",
            code: "NO_SUCH_EMOJI",
            id: "684dec9d-a8c2-4364-9aa8-456c49cb1dc8",
        },
        duplicateName: {
            message: "Duplicate name.",
            code: "DUPLICATE_NAME",
            id: "f7a3462c-4e6e-4069-8421-b9bd4f4c3975",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        id: { type: "string", format: "misskey:id" },
        name: { type: "string" },
        category: {
            type: "string",
            nullable: true,
            description: "Use `null` to reset the category.",
        },
        aliases: { type: "array", items: {
            type: "string",
        } },
    },
    required: ["id", "name", "aliases"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps) => {
    const emoji = await Emojis.findOneBy({ id: ps.id });

    if (emoji == null) throw new ApiError(meta.errors.noSuchEmoji);

    if (emoji.name != ps.name) {
        const existemojis = await Emojis.findOneBy({
            host: IsNull(),
            name: ps.name,
        });

        if (existemojis != null) {
            throw new ApiError(meta.errors.duplicateName);
        }
    }

    await Emojis.update(emoji.id, {
        updatedAt: new Date(),
        name: ps.name,
        category: ps.category,
        aliases: ps.aliases,
    });

    await db.queryResultCache!.remove(["meta_emojis"]);
});
