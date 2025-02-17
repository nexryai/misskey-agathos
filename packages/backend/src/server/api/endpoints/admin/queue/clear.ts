import { destroy } from "@/queue/index.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import define from "../../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    destroy();

    insertModerationLog(me, "clearQueue");
});
