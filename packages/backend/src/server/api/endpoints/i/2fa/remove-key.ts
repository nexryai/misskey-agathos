import { UserProfiles, UserSecurityKeys, Users } from "@/models/index.js";
import { publishMainStream } from "@/services/stream.js";
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
        credentialId: { type: "string" },
    },
    required: ["password", "credentialId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

    // Compare password
    const same = await comparePassword(ps.password, profile.password!);

    if (!same) {
        throw new Error("incorrect password");
    }

    // Make sure we only delete the user's own creds
    await UserSecurityKeys.delete({
        userId: user.id,
        id: ps.credentialId,
    });

    // Publish meUpdated event
    publishMainStream(user.id, "meUpdated", await Users.pack(user.id, user, {
        detail: true,
        includeSecrets: true,
    }));

    return {};
});
