import { promoteAllDeliverJobs, promoteAllInboxJobs } from "@/queue/index.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import define from "../../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireAdmin: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        type: {
            type: "string",
            enum: ["deliver", "inbox"],
            nullable: false,
        },
    },
    required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
    switch (ps.type) {
        case "deliver":
            await promoteAllDeliverJobs();
            break;
        case "inbox":
            await promoteAllInboxJobs();
            break;
    }

    insertModerationLog(me, "promoteQueue");
});
