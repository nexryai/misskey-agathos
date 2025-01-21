import { v4 as uuid } from "uuid";
import config from "@/config/index.js";
import { WellKnownContext } from "@/remote/activitypub/misc/contexts.js";
import { IActivity } from "../type.js";

export const renderActivity = (x: any): IActivity | null => {
    if (x == null) return null;

    if (typeof x === "object" && x.id == null) {
        x.id = `${config.url}/${uuid()}`;
    }

    return Object.assign({}, WellKnownContext, x);
};
