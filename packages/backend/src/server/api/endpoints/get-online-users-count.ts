import { MoreThan } from "typeorm";
import { USER_ONLINE_THRESHOLD } from "@/const.js";
import { Users } from "@/models/index.js";
import define from "../define.js";

export const meta = {
    tags: ["meta"],

    requireCredential: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async () => {
    const count = await Users.countBy({
        lastActiveDate: MoreThan(new Date(Date.now() - USER_ONLINE_THRESHOLD)),
    });

    return {
        count,
    };
});
