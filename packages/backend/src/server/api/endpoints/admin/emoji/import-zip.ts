import ms from "ms";
import { createImportCustomEmojisJob } from "@/queue/index.js";
import define from "../../../define.js";

export const meta = {
    secure: true,
    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        fileId: { type: "string", format: "misskey:id" },
    },
    required: ["fileId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    createImportCustomEmojisJob(user, ps.fileId);
});
