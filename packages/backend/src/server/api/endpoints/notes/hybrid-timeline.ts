import { Brackets } from "typeorm";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { Followings, Notes } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import define from "../../define.js";
import { ApiError } from "../../error.js";
import { makePaginationQuery } from "../../common/make-pagination-query.js";
import { generateVisibilityQuery } from "../../common/generate-visibility-query.js";
import { generateMutedUserQuery } from "../../common/generate-muted-user-query.js";
import { generateRepliesQuery } from "../../common/generate-replies-query.js";
import { generateMutedNoteQuery } from "../../common/generate-muted-note-query.js";
import { generateBlockedUserQuery } from "../../common/generate-block-query.js";
import { generateMutedRenotesQuery } from "../../common/generated-muted-renote-query.js";

export const meta = {
    tags: ["notes"],

    requireCredential: true,

    res: {
        type: "array",
        optional: false, nullable: false,
        items: {
            type: "object",
            optional: false, nullable: false,
            ref: "Note",
        },
    },

    errors: {
        stlDisabled: {
            message: "Hybrid timeline has been disabled.",
            code: "STL_DISABLED",
            id: "620763f4-f621-4533-ab33-0577a1a3c342",
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        sinceId: { type: "string", format: "misskey:id" },
        untilId: { type: "string", format: "misskey:id" },
        sinceDate: { type: "integer" },
        untilDate: { type: "integer" },
        includeMyRenotes: { type: "boolean", default: true },
        includeRenotedMyNotes: { type: "boolean", default: true },
        includeLocalRenotes: { type: "boolean", default: true },
        withFiles: {
            type: "boolean",
            default: false,
            description: "Only show notes that have attached files.",
        },
    },
    required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    const m = await fetchMeta();
    if (m.disableLocalTimeline && (!user.isAdmin && !user.isModerator)) {
        throw new ApiError(meta.errors.stlDisabled);
    }

    //#region Construct query
    const followingQuery = Followings.createQueryBuilder("following")
        .select("following.followeeId")
        .where("following.followerId = :followerId", { followerId: user.id });

    const query = makePaginationQuery(Notes.createQueryBuilder("note"),
        ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
        .andWhere("note.id > :minId", { minId: genId(new Date(Date.now() - (1000 * 60 * 60 * 24 * 10))) }) // 10日前まで
        .andWhere(new Brackets(qb => {
		    qb.where(`((note.userId IN (${ followingQuery.getQuery() })) OR (note.userId = :meId))`, { meId: user.id })
                .orWhere("(note.visibility = 'public') AND (note.userHost IS NULL)");
        }))
        .innerJoinAndSelect("note.user", "user")
        .leftJoinAndSelect("user.avatar", "avatar")
        .leftJoinAndSelect("user.banner", "banner")
        .leftJoinAndSelect("note.reply", "reply")
        .leftJoinAndSelect("note.renote", "renote")
        .leftJoinAndSelect("reply.user", "replyUser")
        .leftJoinAndSelect("replyUser.avatar", "replyUserAvatar")
        .leftJoinAndSelect("replyUser.banner", "replyUserBanner")
        .leftJoinAndSelect("renote.user", "renoteUser")
        .leftJoinAndSelect("renoteUser.avatar", "renoteUserAvatar")
        .leftJoinAndSelect("renoteUser.banner", "renoteUserBanner")
        .setParameters(followingQuery.getParameters());

    generateRepliesQuery(query, user);
    generateVisibilityQuery(query, user);
    generateMutedUserQuery(query, user);
    generateMutedNoteQuery(query, user);
    generateBlockedUserQuery(query, user);
    generateMutedRenotesQuery(query, user);

    if (ps.includeMyRenotes === false) {
        query.andWhere(new Brackets(qb => {
            qb.orWhere("note.userId != :meId", { meId: user.id });
            qb.orWhere("note.renoteId IS NULL");
            qb.orWhere("note.text IS NOT NULL");
            qb.orWhere("note.fileIds != '{}'");
            qb.orWhere("0 < (SELECT COUNT(*) FROM poll WHERE poll.\"noteId\" = note.id)");
        }));
    }

    if (ps.includeRenotedMyNotes === false) {
        query.andWhere(new Brackets(qb => {
            qb.orWhere("note.renoteUserId != :meId", { meId: user.id });
            qb.orWhere("note.renoteId IS NULL");
            qb.orWhere("note.text IS NOT NULL");
            qb.orWhere("note.fileIds != '{}'");
            qb.orWhere("0 < (SELECT COUNT(*) FROM poll WHERE poll.\"noteId\" = note.id)");
        }));
    }

    if (ps.includeLocalRenotes === false) {
        query.andWhere(new Brackets(qb => {
            qb.orWhere("note.renoteUserHost IS NOT NULL");
            qb.orWhere("note.renoteId IS NULL");
            qb.orWhere("note.text IS NOT NULL");
            qb.orWhere("note.fileIds != '{}'");
            qb.orWhere("0 < (SELECT COUNT(*) FROM poll WHERE poll.\"noteId\" = note.id)");
        }));
    }

    if (ps.withFiles) {
        query.andWhere("note.fileIds != '{}'");
    }
    //#endregion

    const timeline = await query.take(ps.limit).getMany();
    return await Notes.packMany(timeline, user);
});
