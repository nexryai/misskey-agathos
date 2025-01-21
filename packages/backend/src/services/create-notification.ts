import { publishMainStream } from "@/services/stream.js";
import { pushNotification } from "@/services/push-notification.js";
import { Notifications, Mutings, UserProfiles, Blockings } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import { User } from "@/models/entities/user.js";
import { Notification } from "@/models/entities/notification.js";

export async function createNotification(
    notifieeId: User["id"],
    type: Notification["type"],
    data: Partial<Notification>,
) {
    if (data.notifierId && (notifieeId === data.notifierId)) {
        return null;
    }

    const profile = await UserProfiles.findOneBy({ userId: notifieeId });

    const isMuted = profile?.mutingNotificationTypes.includes(type);

    // Create notification
    const notification = await Notifications.insert({
        id: genId(),
        createdAt: new Date(),
        notifieeId: notifieeId,
        type: type,
        // 相手がこの通知をミュートしているようなら、既読を予めつけておく
        isRead: isMuted,
        ...data,
    } as Partial<Notification>)
        .then(x => Notifications.findOneByOrFail(x.identifiers[0]));

    const packed = await Notifications.pack(notification, {});

    // Publish notification event
    publishMainStream(notifieeId, "notification", packed);

    // 2秒経っても(今回作成した)通知が既読にならなかったら「未読の通知がありますよ」イベントを発行する
    setTimeout(async () => {
        const fresh = await Notifications.findOneBy({ id: notification.id });
        if (fresh == null) return; // 既に削除されているかもしれない
        if (fresh.isRead) return;

        //#region ただしミュートかブロックしているユーザーからの通知なら無視
        const mutings = await Mutings.findBy({
            muterId: notifieeId,
        });
        const blockings = await Blockings.findBy({
            blockerId: notifieeId,
        });
        if (data.notifierId && mutings.map(m => m.muteeId).includes(data.notifierId)) {
            return;
        }
        if (data.notifierId && blockings.map(m => m.blockeeId).includes(data.notifierId)) {
            return;
        }
        //#endregion

        publishMainStream(notifieeId, "unreadNotification", packed);
        pushNotification(notifieeId, "notification", packed);
    }, 2000);

    return notification;
}
