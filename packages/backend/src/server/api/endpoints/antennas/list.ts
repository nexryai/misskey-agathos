import { Antennas } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
    tags: ["antennas", "account"],

    requireCredential: true,

    kind: "read:account",

    res: {
        type: "array",
        optional: false, nullable: false,
        items: {
            type: "object",
            optional: false, nullable: false,
            ref: "Antenna",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const antennas = await Antennas.findBy({
        userId: me.id,
    });

    return await Promise.all(antennas.map(x => Antennas.pack(x)));
});
