import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { db } from "@/db/postgre.js";
import define from "../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        full: { type: "boolean" },
        analyze: { type: "boolean" },
    },
    required: ["full", "analyze"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const params: string[] = [];

    if (ps.full) {
        params.push("FULL");
    }

    if (ps.analyze) {
        params.push("ANALYZE");
    }

    db.query("VACUUM " + params.join(" "));

    insertModerationLog(me, "vacuum", ps);
});
