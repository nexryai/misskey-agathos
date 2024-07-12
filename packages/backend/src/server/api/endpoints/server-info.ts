import * as os from "node:os";
import define from "../define.js";

export const meta = {
    requireCredential: false,

    tags: ["meta"],
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async () => {
    return {
        machine: os.hostname(),
        cpu: {
            model: os.cpus()[0].model,
            cores: os.cpus().length,
        },
        mem: {
            total: os.totalmem(),
        },
    };
});
