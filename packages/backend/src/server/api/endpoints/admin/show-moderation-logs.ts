import { ModerationLogs } from "@/models/index.js";
import define from "../../define.js";
import { makePaginationQuery } from "../../common/make-pagination-query.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,

    res: {
        type: "array",
        optional: false, nullable: false,
        items: {
            type: "object",
            optional: false, nullable: false,
            properties: {
                id: {
                    type: "string",
                    optional: false, nullable: false,
                    format: "id",
                },
                createdAt: {
                    type: "string",
                    optional: false, nullable: false,
                    format: "date-time",
                },
                type: {
                    type: "string",
                    optional: false, nullable: false,
                },
                info: {
                    type: "object",
                    optional: false, nullable: false,
                },
                userId: {
                    type: "string",
                    optional: false, nullable: false,
                    format: "id",
                },
                user: {
                    type: "object",
                    optional: false, nullable: false,
                    ref: "UserDetailed",
                },
            },
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        sinceId: { type: "string", format: "misskey:id" },
        untilId: { type: "string", format: "misskey:id" },
        userId: { type: "string", format: "misskey:id", nullable: true },
        type: { type: "string", nullable: true },
    },
    required: [],
} as const;

export default define(meta, paramDef, async (ps) => {
    const query = makePaginationQuery(ModerationLogs.createQueryBuilder("report"), ps.sinceId, ps.untilId);

    if (ps.userId) {
        query.andWhere("report.userId = :userId", { userId: ps.userId });
    }

    if (ps.type) {
        query.andWhere("report.type = :type", { type: ps.type });
    }

    const reports = await query.take(ps.limit).getMany();

    return await ModerationLogs.packMany(reports);
});
