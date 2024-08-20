import { CacheableRemoteUser } from "@/models/entities/user.js";
import Resolver from "../../resolver.js";
import { IAnnounce, getApId } from "../../type.js";
import { apLogger } from "../../logger.js";
import announceNote from "./note.js";

const logger = apLogger;

export default async (actor: CacheableRemoteUser, activity: IAnnounce): Promise<void> => {
    const uri = getApId(activity);

    logger.info(`Announce: ${uri}`);

    const resolver = new Resolver();

    const targetUri = getApId(activity.object);

    announceNote(resolver, actor, activity, targetUri);
};
