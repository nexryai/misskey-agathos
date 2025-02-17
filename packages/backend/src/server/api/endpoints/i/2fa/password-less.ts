import { UserProfiles } from "@/models/index.js";
import define from "../../../define.js";

export const meta = {
    requireCredential: true,

    secure: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        value: { type: "boolean" },
    },
    required: ["value"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    await UserProfiles.update(user.id, {
        usePasswordLessLogin: ps.value,
    });
});
