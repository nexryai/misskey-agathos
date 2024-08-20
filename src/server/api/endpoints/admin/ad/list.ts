import { Ads } from "@/models/index.js";
import define from "../../../define.js";
import { makePaginationQuery } from "../../../common/make-pagination-query.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        sinceId: { type: "string", format: "misskey:id" },
        untilId: { type: "string", format: "misskey:id" },
    },
    required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps) => {
    const query = makePaginationQuery(Ads.createQueryBuilder("ad"), ps.sinceId, ps.untilId);

    const ads = await query.take(ps.limit).getMany();

    return ads;
});
