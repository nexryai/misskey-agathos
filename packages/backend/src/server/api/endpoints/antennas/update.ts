import { Antennas, UserLists } from "@/models/index.js";
import { publishInternalEvent } from "@/services/stream.js";
import define from "../../define.js";
import { ApiError } from "../../error.js";

export const meta = {
    tags: ["antennas"],

    requireCredential: true,

    kind: "write:account",

    errors: {
        noSuchAntenna: {
            message: "No such antenna.",
            code: "NO_SUCH_ANTENNA",
            id: "10c673ac-8852-48eb-aa1f-f5b67f069290",
        },

        noSuchUserList: {
            message: "No such user list.",
            code: "NO_SUCH_USER_LIST",
            id: "1c6b35c9-943e-48c2-81e4-2844989407f7",
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
        antennaId: { type: "string", format: "misskey:id" },
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
    required: ["antennaId", "name", "src", "keywords", "excludeKeywords", "users", "caseSensitive", "withReplies", "withFile", "notify"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    // Fetch the antenna
    const antenna = await Antennas.findOneBy({
        id: ps.antennaId,
        userId: user.id,
    });

    if (antenna == null) {
        throw new ApiError(meta.errors.noSuchAntenna);
    }

    let userList;
    let userGroupJoining;

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

    await Antennas.update(antenna.id, {
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
    });

    publishInternalEvent("antennaUpdated", await Antennas.findOneByOrFail({ id: antenna.id }));

    return await Antennas.pack(antenna.id);
});
