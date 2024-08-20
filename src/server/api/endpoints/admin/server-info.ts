import * as os from "node:os";
import { db } from "@/db/postgre.js";
import define from "../../define.js";
import { redisClient } from "../../../../db/redis.js";

export const meta = {
    requireCredential: true,
    requireModerator: true,

    tags: ["admin", "meta"],

    res: {
        type: "object",
        optional: false, nullable: false,
        properties: {
            machine: {
                type: "string",
                optional: false, nullable: false,
            },
            os: {
                type: "string",
                optional: false, nullable: false,
                example: "linux",
            },
            node: {
                type: "string",
                optional: false, nullable: false,
            },
            psql: {
                type: "string",
                optional: false, nullable: false,
            },
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async () => {
    const redisServerInfo = await redisClient.info("Server");
    const m = redisServerInfo.match(new RegExp("^redis_version:(.*)", "m"));
    const redis_version = m?.[1];

    return {
        machine: os.hostname(),
        os: os.platform(),
        node: process.version,
        psql: await db.query("SHOW server_version").then(x => x[0].server_version),
        redis: redis_version,
        cpu: {
            model: os.cpus()[0].model,
            cores: os.cpus().length,
        },
    };
});
