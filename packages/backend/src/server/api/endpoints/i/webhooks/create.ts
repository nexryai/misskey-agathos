import { genId } from "@/misc/gen-id.js";
import { Webhooks } from "@/models/index.js";
import { publishInternalEvent } from "@/services/stream.js";
import { webhookEventTypes } from "@/models/entities/webhook.js";
import define from "../../../define.js";

export const meta = {
    tags: ["webhooks"],

    requireCredential: true,

    kind: "write:account",
} as const;

export const paramDef = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        url: { type: "string", minLength: 1, maxLength: 1024 },
        secret: { type: "string", maxLength: 1024, default: "" },
        on: { type: "array", items: {
            type: "string", enum: webhookEventTypes,
        } },
    },
    required: ["name", "url", "on"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    const webhook = await Webhooks.insert({
        id: genId(),
        createdAt: new Date(),
        userId: user.id,
        name: ps.name,
        url: ps.url,
        secret: ps.secret,
        on: ps.on,
    }).then(x => Webhooks.findOneByOrFail(x.identifiers[0]));

    publishInternalEvent("webhookCreated", webhook);

    return webhook;
});
