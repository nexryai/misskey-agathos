import { SwSubscriptions } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
    tags: ["account"],

    requireCredential: true,

    description: "Unregister from receiving push notifications.",
} as const;

export const paramDef = {
    type: "object",
    properties: {
        endpoint: { type: "string" },
    },
    required: ["endpoint"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    await SwSubscriptions.delete({
        userId: user.id,
        endpoint: ps.endpoint,
    });
});
