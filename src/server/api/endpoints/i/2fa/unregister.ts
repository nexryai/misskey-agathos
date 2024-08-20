import { UserProfiles } from "@/models/index.js";
import { comparePassword } from "@/misc/password.js";
import define from "../../../define.js";
export const meta = {
    requireCredential: true,

    secure: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        password: { type: "string" },
    },
    required: ["password"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
    const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

    // Compare password
    const same = await comparePassword(ps.password, profile.password!);

    if (!same) {
        throw new Error("incorrect password");
    }

    await UserProfiles.update(user.id, {
        twoFactorSecret: null,
        twoFactorBackupSecret: null,
        twoFactorEnabled: false,
    });
});
