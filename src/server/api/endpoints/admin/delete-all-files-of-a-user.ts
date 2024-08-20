import { deleteFile } from "@/services/drive/delete-file.js";
import { DriveFiles, Users } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        userId: { type: "string", format: "misskey:id" },
    },
    required: ["userId"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
    const files = await DriveFiles.findBy({
        userId: ps.userId,
    });

    const user = await Users.findOneByOrFail({ id: ps.userId });

    if (user.isAdmin) {
        throw new Error("cannot delete files of admin");
    }

    if (me.isModerator && user.isModerator) {
        throw new Error("cannot delete files of moderator");
    }

    for (const file of files) {
        deleteFile(file);
    }
});
