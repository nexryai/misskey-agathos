import { genId } from "@/misc/gen-id.js";
import { RenoteMutings } from "@/models/index.js";
import { RenoteMuting } from "@/models/entities/renote-muting.js";
import define from "../../define.js";
import { ApiError } from "../../error.js";
import { getUser } from "../../common/getters.js";

export const meta = {
    tags: ["account"],

    requireCredential: true,

    kind: "write:mutes",

    errors: {
        noSuchUser: {
            message: "No such user.",
            code: "NO_SUCH_USER",
            id: "6fef56f3-e765-4957-88e5-c6f65329b8a5",
        },

        muteeIsYourself: {
            message: "Mutee is yourself.",
            code: "MUTEE_IS_YOURSELF",
            id: "a4619cb2-5f23-484b-9301-94c903074e10",
        },

        alreadyMuting: {
            message: "You are already muting that user.",
            code: "ALREADY_MUTING",
            id: "7e7359cb-160c-4956-b08f-4d1c653cd007",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        userId: { type: "string", format: "misskey:id" },
    },
    required: ["userId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    const muter = user;

    // 自分自身
    if (user.id === ps.userId) {
        throw new ApiError(meta.errors.muteeIsYourself);
    }

    // Get mutee
    const mutee = await getUser(ps.userId).catch(e => {
        if (e.id === "15348ddd-432d-49c2-8a5a-8069753becff") throw new ApiError(meta.errors.noSuchUser);
        throw e;
    });

    // Check if already muting
    const exist = await RenoteMutings.findOneBy({
        muterId: muter.id,
        muteeId: mutee.id,
    });

    if (exist != null) {
        throw new ApiError(meta.errors.alreadyMuting);
    }

    // Create mute
    await RenoteMutings.insert({
        id: genId(),
        createdAt: new Date(),
        muterId: muter.id,
        muteeId: mutee.id,
    } as RenoteMuting);

    // publishUserEvent(user.id, 'mute', mutee);
});
