import { Users } from "@/models/index.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { doPostUnsuspend } from "@/services/unsuspend-user.js";
import define from "../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        userId: { type: "string", format: "misskey:id" },
    },
    required: ["userId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const user = await Users.findOneBy({ id: ps.userId });

    if (user == null) {
        throw new Error("user not found");
    }

    await Users.update(user.id, {
        isSuspended: false,
    });

    insertModerationLog(me, "unsuspend", {
        targetId: user.id,
    });

    doPostUnsuspend(user);
});
