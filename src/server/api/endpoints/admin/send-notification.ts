import { Users, UserProfiles } from "@/models/index.js";
import { createNotification } from "@/services/create-notification.js";
import define from "../../define.js";
import { ApiError } from "../../error.js";

export const meta = {
    tags: ["users"],

    requireCredential: true,
    requireModerator: true,

    description: "Send a notification.",

    errors: {
        noSuchUser: {
            message: "No such user.",
            code: "NO_SUCH_USER",
            id: "1acefcb5-0959-43fd-9685-b48305736cb5",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        userId: { type: "string", format: "misskey:id" },
        comment: { type: "string", minLength: 1, maxLength: 2048 },
    },
    required: ["userId", "comment"],
} as const;

export default define(meta, paramDef, async (ps) => {
    const [user, profile] = await Promise.all([
        Users.findOneBy({ id: ps.userId }),
        UserProfiles.findOneBy({ userId: ps.userId }),
    ]);

    if (user == null || profile == null) {
        throw new ApiError(meta.errors.noSuchUser);
    }

    if (!Users.isLocalUser(user)) {
        throw new ApiError(meta.errors.noSuchUser);
    }

    createNotification(user.id, "app", {
        customBody: ps.comment,
        customHeader: "Moderation Notification 運営からの通知",
        customIcon: "/static-assets/mi-white.png",
    });
});
