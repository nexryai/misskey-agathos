import deleteFollowing from "@/services/following/delete.js";
import { Followings, Users, Instances } from "@/models/index.js";
import { toPuny } from "@/misc/convert-host.js";
import define from "../../../define.js";

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

    if (instance.isBlocked || instance.isSuspended) throw new Error("instance is either blocked or suspended");
    if (instance == null) throw new Error("instance not found");

    const followings = await Followings.findBy({
        followerHost: ps.host,
    });

    const pairs = await Promise.all(followings.map(f => Promise.all([
        Users.findOneByOrFail({ id: f.followerId }),
        Users.findOneByOrFail({ id: f.followeeId }),
    ])));

    for (const pair of pairs) {
        deleteFollowing(pair[0], pair[1]);
    }
});
