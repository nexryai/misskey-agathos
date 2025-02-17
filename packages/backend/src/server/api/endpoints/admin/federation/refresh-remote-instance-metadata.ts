import { Instances } from "@/models/index.js";
import { toPuny } from "@/misc/convert-host.js";
import { fetchInstanceMetadata } from "@/services/fetch-instance-metadata.js";
import define from "../../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        host: { type: "string" },
    },
    required: ["host"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const instance = await Instances.findOneBy({ host: toPuny(ps.host) });

    if (instance == null) {
        throw new Error("instance not found");
    }

    fetchInstanceMetadata(instance, true);
});
