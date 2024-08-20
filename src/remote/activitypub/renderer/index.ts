import { v4 as uuid } from "uuid";
import config from "@/config/index.js";
import { getUserKeypair } from "@/misc/keypair-store.js";
import { User } from "@/models/entities/user.js";
import { WellKnownContext } from "@/remote/activitypub/misc/contexts.js";
import { IActivity } from "../type.js";
import { LdSignature } from "../misc/ld-signature.js";

export const renderActivity = (x: any): IActivity | null => {
    if (x == null) return null;

    if (typeof x === "object" && x.id == null) {
        x.id = `${config.url}/${uuid()}`;
    }
    
    return Object.assign({}, WellKnownContext, x);
};

export const attachLdSignature = async (activity: any, user: { id: User["id"]; host: null; }): Promise<IActivity | null> => {
    if (activity == null) return null;

    const keypair = await getUserKeypair(user.id);

    const ldSignature = new LdSignature();
    ldSignature.debug = false;
    activity = await ldSignature.signRsaSignature2017(activity, keypair.privateKey, `${config.url}/users/${user.id}#main-key`);

    return activity;
};
