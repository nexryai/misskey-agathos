import { CacheableRemoteUser } from "@/models/entities/user.js";
import { remoteReject } from "@/services/following/reject.js";
import { Users } from "@/models/index.js";
import { IFollow } from "../../type.js";
import DbResolver from "../../db-resolver.js";

export default async (actor: CacheableRemoteUser, activity: IFollow): Promise<string> => {
    // ※ activityはこっちから投げたフォローリクエストなので、activity.actorは存在するローカルユーザーである必要がある

    const dbResolver = new DbResolver();
    const follower = await dbResolver.getUserFromApId(activity.actor);

    if (follower == null) {
        return "skip: follower not found";
    }

    if (!Users.isLocalUser(follower)) {
        return "skip: follower is not a local user";
    }

    await remoteReject(actor, follower);
    return "ok";
};
