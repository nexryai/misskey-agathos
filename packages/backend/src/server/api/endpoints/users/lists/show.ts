import { UserLists } from "@/models/index.js";
import define from "../../../define.js";
import { ApiError } from "../../../error.js";

export const meta = {
    tags: ["lists", "account"],

    requireCredential: true,

    kind: "read:account",

    description: "Show the properties of a list.",

    res: {
        type: "object",
        optional: false, nullable: false,
        ref: "UserList",
    },

    errors: {
        noSuchList: {
            message: "No such list.",
            code: "NO_SUCH_LIST",
            id: "7bc05c21-1d7a-41ae-88f1-66820f4dc686",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        listId: { type: "string", format: "misskey:id" },
    },
    required: ["listId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    // Fetch the list
    const userList = await UserLists.findOneBy({
        id: ps.listId,
        userId: me.id,
    });

    if (userList == null) {
        throw new ApiError(meta.errors.noSuchList);
    }

    return await UserLists.pack(userList);
});
