import { Users, Instances, Emojis } from "@/models/index.js";
import { doPostSuspend } from "@/services/suspend-user.js";
import { publishUserEvent } from "@/services/stream.js";
import { createDeleteAccountJob } from "@/queue/index.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { toPuny } from "@/misc/convert-host.js";
import define from "../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireAdmin: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        host: { type: "string" },
    },
    required: ["host"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
    const instance = await Instances.findOneBy({ host: toPuny(ps.host) });

    if (instance == null) throw new Error("instance not found");
    if (!instance.isBlocked && !instance.isSuspended) throw new Error("instance is neither blocked nor suspended");

    const users = await Users.findBy({
        host: instance.host,
    });

    for (const user of users) {
        if (user == null) {
            throw new Error("user not found");
        }

        createDeleteAccountJob(user, {
            soft: false,
        });

        await Users.update(user.id, {
            isDeleted: true,
        });
    }

    const emojis = await Emojis.findBy({
        host: instance.host,
    });

    for (const emoji of emojis) {
        await Emojis.delete(emoji.id);
    }
});
