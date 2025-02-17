import { Clips } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
    tags: ["clips", "account"],

    requireCredential: true,

    kind: "read:account",

    res: {
        type: "array",
        optional: false, nullable: false,
        items: {
            type: "object",
            optional: false, nullable: false,
            ref: "Clip",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const clips = await Clips.findBy({
        userId: me.id,
    });

    return await Promise.all(clips.map(x => Clips.pack(x)));
});
