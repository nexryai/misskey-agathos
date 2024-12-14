import Bull from "bull";
import { AccessTokens, DriveFiles, Notes, UserProfiles, Users, UserNotePinings, MessagingMessages, Followings, Mutings, Blockings, Notifications, FollowRequests, Antennas, NoteReactions, Clips } from "@/models/index.js";
import { DbUserDeleteJobData } from "@/queue/types.js";
import { Note } from "@/models/entities/note.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import { deleteFileSync } from "@/services/drive/delete-file.js";
import deleteFollowing from "@/services/following/delete.js";
import cancelFollowRequest from "@/services/following/requests/cancel.js";
import { rejectFollowRequest } from "@/services/following/reject.js";
import { publishUserEvent, publishInternalEvent } from "@/services/stream.js";
import { queueLogger } from "../../logger.js";

const logger = queueLogger.createSubLogger("delete-account");

export async function deleteAccount(job: Bull.Job<DbUserDeleteJobData>): Promise<string | void> {
    logger.info(`Deleting account of ${job.data.user.id} ...`);

    const user = await Users.findOneBy({ id: job.data.user.id });
    if (user == null) {
        return;
    }

    { // Reject Follows
        // When deleting a remote account, the account obviously doesn't
        // actually become deleted on its origin server, i.e. unlike a
        // locally deleted account it continues to have access to its home
        // feed and other content. To prevent it from being able to continue
        // to access toots it would receive because it follows local accounts,
        // we have to force it to unfollow them.

        if (!Users.isLocalUser(job.data.user)) {
            const follower = user;

            const followings = await Followings.findBy({
                followerId: follower.id,
            });

            for (const following of followings) {
                const followee = await Users.findOneBy({
                    id: following.followeeId,
                });

                if (followee != null) {
                    await deleteFollowing(follower, followee, true);
                }
            }

            const requests = await FollowRequests.findBy({
                followerId: follower.id,
            });

            for (const request of requests) {
                const followee = await Users.findOneBy({
                    id: request.followeeId,
                });

                if (followee != null) {
                    await rejectFollowRequest(followee, follower);
                }
            }
        }
    }

    { // Undo Follows
        // When deleting a remote account, the account obviously doesn't
    // actually become deleted on its origin server, but following relationships
    // are severed on our end. Therefore, make the remote server aware that the
    // follow relationships are severed to avoid confusion and potential issues
    // if the remote account gets un-suspended.

        if (!Users.isLocalUser(job.data.user)) {
            const followee = user;

            const followers = await Followings.findBy({
                followeeId: followee.id,
            });

            for (const following of followers) {
                const follower = await Users.findOneBy({
                    id: following.followerId,
                });

                if (follower != null) {
                    await deleteFollowing(follower, followee, true);
                }
            }

            const requests = await FollowRequests.findBy({
                followeeId: followee.id,
            });

            for (const request of requests) {
                const follower = await Users.findOneBy({
                    id: request.followerId,
                });

                if (follower != null) {
                    await cancelFollowRequest(followee, follower);
                }
            }
        }
    }

    { // Delete notes
        const notesCount = await Notes.createQueryBuilder("note")
    .where("note.userId = :userId", { userId: job.data.user.id })
    .getCount();

        while (true) {
            const notes = await Notes.find({
                where: {
                    userId: user.id,
                },
                take: 50,
            }) as Note[];

            if (notes.length === 0) {
                break;
            }

            await Notes.delete(notes.map(note => note.id));

            const currentNotesCount = await Notes.createQueryBuilder("note")
			.where("note.userId = :userId", { userId: job.data.user.id })
			.getCount();

            const deleteprogress = currentNotesCount === 0 ? 99 : Math.floor(100 - (currentNotesCount / notesCount) * 100);

            job.progress(deleteprogress);
        }

        logger.succ("All of notes deleted");
    }

    { // Delete files
        while (true) {
            const files = await DriveFiles.find({
                where: {
                    userId: user.id,
                },
                take: 10,
            }) as DriveFile[];

            if (files.length === 0) {
                break;
            }

            for (const file of files) {
                await deleteFileSync(file);
            }
        }

        logger.succ("All of files deleted");
    }

    // soft指定されている場合は物理削除しない
    if (job.data.soft) {
        // nop
        await MessagingMessages.delete({
            userId: job.data.user.id,
        });
    } else {
        if (Users.isLocalUser(job.data.user)) {
            await UserProfiles.update(job.data.user.id, {
                description: null,
                password: null,
                twoFactorSecret: null,
                twoFactorTempSecret: null,
                twoFactorEnabled: false,
                location: null,
                birthday: null,
                description: null,
                fields: [],
                clientData: {},
                integrations: {},
            });
            await Users.update(job.data.user.id, {
                isDeleted: true,
                isSuspended: true,
                name: null,
                followersCount: 0,
                followingCount: 0,
                notesCount: 0,
                avatarId: null,
                bannerId: null,
            });
            await UserNotePinings.delete({
                userId: job.data.user.id,
            });
            await AccessTokens.delete({
                userId: job.data.user.id,
            });
            await MessagingMessages.delete({
                userId: job.data.user.id,
            });
            await Followings.delete({
                followerId: job.data.user.id,
            });
            await Followings.delete({
                followeeId: job.data.user.id,
            });
            await Mutings.delete({
                muteeId: job.data.user.id,
            });
            await Mutings.delete({
                muterId: job.data.user.id,
            });
            await Blockings.delete({
                blockeeId: job.data.user.id,
            });
            await Blockings.delete({
                blockerId: job.data.user.id,
            });
            await Notifications.delete({
                notifierId: job.data.user.id,
            });
            await Notifications.delete({
                notifieeId: job.data.user.id,
            });
            await FollowRequests.delete({
                followerId: job.data.user.id,
            });
            await FollowRequests.delete({
                followeeId: job.data.user.id,
            });
            await Antennas.delete({
                userId: job.data.user.id,
            });
            await NoteReactions.delete({
                userId: job.data.user.id,
            });
            await Clips.delete({
                userId: job.data.user.id,
            });
            publishInternalEvent("userChangeSuspendedState", { id: job.data.user.id, isSuspended: true });
            publishUserEvent(job.data.user.id, "terminate", {});
        } else {
            await Users.delete(job.data.user.id);
        }
    }

    return "Account deleted";
}
