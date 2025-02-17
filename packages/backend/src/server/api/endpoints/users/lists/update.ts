import { UserLists } from "@/models/index.js";
import define from "../../../define.js";
import { ApiError } from "../../../error.js";

export const meta = {
    tags: ["lists"],

    requireCredential: true,

    kind: "write:account",

    description: "Update the properties of a list.",

    res: {
        type: "object",
        optional: false, nullable: false,
        ref: "UserList",
    },

    errors: {
        noSuchList: {
            message: "No such list.",
            code: "NO_SUCH_LIST",
            id: "796666fe-3dff-4d39-becb-8a5932c1d5b7",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        listId: { type: "string", format: "misskey:id" },
        name: { type: "string", minLength: 1, maxLength: 100 },
    },
    required: ["listId", "name"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    // Fetch the list
    const userList = await UserLists.findOneBy({
        id: ps.listId,
        userId: user.id,
    });

    if (userList == null) {
        throw new ApiError(meta.errors.noSuchList);
    }

    await UserLists.update(userList.id, {
        name: ps.name,
    });

    return await UserLists.pack(userList.id);
});
