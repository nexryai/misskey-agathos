import ms from "ms";
import { createExportUserListsJob } from "@/queue/index.js";
import define from "../../define.js";

export const meta = {
    secure: true,
    requireCredential: true,
    limit: {
        duration: ms("1min"),
        max: 1,
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
    createExportUserListsJob(user);
});
