import { computed, reactive } from "vue";
import { $i } from "./account";

export const navbarItemDef = reactive({
    notifications: {
        title: "notifications",
        icon: "ti ti-bell",
        show: computed(() => $i != null),
        indicated: computed(() => $i != null && $i.hasUnreadNotification),
        to: "/my/notifications",
    },
    drive: {
        title: "drive",
        icon: "ti ti-cloud",
        show: computed(() => $i != null),
        to: "/my/drive",
    },
    followRequests: {
        title: "followRequests",
        icon: "ti ti-user-plus",
        show: computed(() => $i != null && ($i.isLocked || $i.hasPendingReceivedFollowRequest)),
        indicated: computed(() => $i != null && $i.hasPendingReceivedFollowRequest),
        to: "/my/follow-requests",
    },
    explore: {
        title: "explore",
        icon: "ti ti-hash",
        to: "/explore",
    },
    announcements: {
        title: "announcements",
        icon: "ti ti-speakerphone",
        indicated: computed(() => $i != null && $i.hasUnreadAnnouncement),
        to: "/announcements",
    },
    clips: {
        title: "clip",
        icon: "ti ti-paperclip",
        show: computed(() => $i != null),
        to: "/my/clips",
    },
});
