import { MutedNotes } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
    tags: ["account"],

    requireCredential: true,

    kind: "read:account",

    res: {
        type: "object",
        optional: false, nullable: false,
        properties: {
            count: {
                type: "number",
                optional: false, nullable: false,
            },
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    return {
        count: await MutedNotes.countBy({
            userId: user.id,
            reason: "word",
        }),
    };
});
