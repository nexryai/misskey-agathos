import { genId } from "@/misc/gen-id.js";
import { Antennas, UserLists } from "@/models/index.js";
import { publishInternalEvent } from "@/services/stream.js";
import { ApiError } from "../../error.js";
import define from "../../define.js";

export const meta = {
    tags: ["antennas"],

    requireCredential: true,

    kind: "write:account",

    errors: {
        noSuchUserList: {
            message: "No such user list.",
            code: "NO_SUCH_USER_LIST",
            id: "95063e93-a283-4b8b-9aa5-bcdb8df69a7f",
        },

        tooManyAntennas: {
            message: "You cannot create antenna any more.",
            code: "TOO_MANY_ANTENNAS",
            id: "faf47050-e8b5-438c-913c-db2b1576fde4",
        },

        noKeywords: {
            message: "No keywords",
            code: "NO_KEYWORDS",
            id: "aa975b74-1ddb-11ee-be56-0242ac120002",
        },
    },

    res: {
        type: "object",
        optional: false, nullable: false,
        ref: "Antenna",
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        src: { type: "string", enum: ["home", "all", "users", "list"] },
        userListId: { type: "string", format: "misskey:id", nullable: true },
        userGroupId: { type: "string", format: "misskey:id", nullable: true },
        keywords: { type: "array", items: {
            type: "array", items: {
                type: "string",
            },
        } },
        excludeKeywords: { type: "array", items: {
            type: "array", items: {
                type: "string",
            },
        } },
        users: { type: "array", items: {
            type: "string",
        } },
        caseSensitive: { type: "boolean" },
        withReplies: { type: "boolean" },
        withFile: { type: "boolean" },
        notify: { type: "boolean" },
    },
    required: ["name", "src", "keywords", "excludeKeywords", "users", "caseSensitive", "withReplies", "withFile", "notify"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
    const currentAntennasCount = await Antennas.countBy({
        userId: user.id,
    });
    // TODO: ロール機能を移植したらRolePolicies.antennaLimitを参照する
    if ((!user.isAdmin && !user.isModerator) && currentAntennasCount > 5) {
        throw new ApiError(meta.errors.tooManyAntennas);
    }

    let userList;

    if ((ps.keywords.length === 0) || ps.keywords[0].every(x => x === "")) throw new ApiError(meta.errors.noKeywords);

    if (ps.src === "list" && ps.userListId) {
        userList = await UserLists.findOneBy({
            id: ps.userListId,
            userId: user.id,
        });

        if (userList == null) {
            throw new ApiError(meta.errors.noSuchUserList);
        }
    }

    const antenna = await Antennas.insert({
        id: genId(),
        createdAt: new Date(),
        userId: user.id,
        name: ps.name,
        src: ps.src,
        userListId: userList ? userList.id : null,
        keywords: ps.keywords,
        excludeKeywords: ps.excludeKeywords,
        users: ps.users,
        caseSensitive: ps.caseSensitive,
        withReplies: ps.withReplies,
        withFile: ps.withFile,
        notify: ps.notify,
    }).then(x => Antennas.findOneByOrFail(x.identifiers[0]));

    publishInternalEvent("antennaCreated", antenna);

    return await Antennas.pack(antenna);
});
