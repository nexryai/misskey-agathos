import ms from "ms";
import { createExportBlockingJob } from "@/queue/index.js";
import define from "../../define.js";

export const meta = {
    secure: true,
    requireCredential: true,
    limit: {
        duration: ms("1hour"),
        max: 1,
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    createExportBlockingJob(user);
});
