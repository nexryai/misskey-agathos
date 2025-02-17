import { AccessTokens } from "@/models/index.js";
import { publishUserEvent } from "@/services/stream.js";
import define from "../../define.js";

export const meta = {
    requireCredential: true,

    secure: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        tokenId: { type: "string", format: "misskey:id" },
    },
    required: ["tokenId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    const token = await AccessTokens.findOneBy({ id: ps.tokenId });

    if (token) {
        await AccessTokens.delete({
            id: ps.tokenId,
            userId: user.id,
        });

        // Terminate streaming
        publishUserEvent(user.id, "terminate");
    }
});
