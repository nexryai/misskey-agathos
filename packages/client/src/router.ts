import { AsyncComponentLoader, defineAsyncComponent, inject } from "vue";
import { Router } from "@/nirax";
import { $i, iAmModerator, iAmAdmin } from "@/account";
import MkLoading from "@/pages/_loading_.vue";
import MkError from "@/pages/_error_.vue";

const page = (loader: AsyncComponentLoader<any>) => defineAsyncComponent({
    loader: loader,
    loadingComponent: MkLoading,
    errorComponent: MkError,
});

export const routes = [{
    path: "/@:acct/following",
    component: page(() => import("./pages/user/following.vue")),
}, {
    path: "/@:acct/followers",
    component: page(() => import("./pages/user/followers.vue")),
}, {
    name: "user",
    path: "/@:acct/:page?",
    component: page(() => import("./pages/user/index.vue")),
}, {
    name: "note",
    path: "/notes/:noteId",
    component: page(() => import("./pages/note.vue")),
}, {
    path: "/clips/:clipId",
    component: page(() => import("./pages/clip.vue")),
}, {
    path: "/user-info/:userId",
    component: page(() => import("./pages/user-info.vue")),
}, {
    path: "/instance-info/:host",
    component: page(() => import("./pages/instance-info.vue")),
}, {
    name: "settings",
    path: "/settings",
    component: page(() => import("./pages/settings/index.vue")),
    loginRequired: true,
    children: [{
        path: "/profile",
        name: "profile",
        component: page(() => import("./pages/settings/profile.vue")),
    }, {
        path: "/privacy",
        name: "privacy",
        component: page(() => import("./pages/settings/privacy.vue")),
    }, {
        path: "/reaction",
        name: "reaction",
        component: page(() => import("./pages/settings/reaction.vue")),
    }, {
        path: "/drive",
        name: "drive",
        component: page(() => import("./pages/settings/drive.vue")),
    }, {
        path: "/notifications",
        name: "notifications",
        component: page(() => import("./pages/settings/notifications.vue")),
    }, {
        path: "/security",
        name: "security",
        component: page(() => import("./pages/settings/security.vue")),
    }, {
        path: "/general",
        name: "general",
        component: page(() => import("./pages/settings/general.vue")),
    }, {
        path: "/theme/install",
        name: "theme",
        component: page(() => import("./pages/settings/theme.install.vue")),
    }, {
        path: "/theme/manage",
        name: "theme",
        component: page(() => import("./pages/settings/theme.manage.vue")),
    }, {
        path: "/theme",
        name: "theme",
        component: page(() => import("./pages/settings/theme.vue")),
    }, {
        path: "/navbar",
        name: "navbar",
        component: page(() => import("./pages/settings/navbar.vue")),
    }, {
        path: "/sounds",
        name: "sounds",
        component: page(() => import("./pages/settings/sounds.vue")),
    }, {
        path: "/import-export",
        name: "import-export",
        component: page(() => import("./pages/settings/import-export.vue")),
    }, {
        path: "/mute-block",
        name: "mute-block",
        component: page(() => import("./pages/settings/mute-block.vue")),
    }, {
        path: "/api",
        name: "api",
        component: page(() => import("./pages/settings/api.vue")),
    }, {
        path: "/apps",
        name: "api",
        component: page(() => import("./pages/settings/apps.vue")),
    }, {
        path: "/webhook/edit/:webhookId",
        name: "webhook",
        component: page(() => import("./pages/settings/webhook.edit.vue")),
    }, {
        path: "/webhook/new",
        name: "webhook",
        component: page(() => import("./pages/settings/webhook.new.vue")),
    }, {
        path: "/webhook",
        name: "webhook",
        component: page(() => import("./pages/settings/webhook.vue")),
    }, {
        path: "/preferences-backups",
        name: "preferences-backups",
        component: page(() => import("./pages/settings/preferences-backups.vue")),
    }, {
        path: "/custom-css",
        name: "general",
        component: page(() => import("./pages/settings/custom-css.vue")),
    }, {
        path: "/timeline",
        name: "timeline",
        component: page(() => import("./pages/settings/timeline.vue")),
    }, {
        path: "/accounts",
        name: "profile",
        component: page(() => import("./pages/settings/accounts.vue")),
    }, {
        path: "/account-info",
        name: "other",
        component: page(() => import("./pages/settings/account-info.vue")),
    }, {
        path: "/delete-account",
        name: "other",
        component: page(() => import("./pages/settings/delete-account.vue")),
    }, {
        path: "/other",
        name: "other",
        component: page(() => import("./pages/settings/other.vue")),
    }, {
        path: "/",
        component: page(() => import("./pages/_empty_.vue")),
    }],
}, {
    path: "/reset-password/:token?",
    component: page(() => import("./pages/reset-password.vue")),
}, {
    path: "/signup-complete/:code",
    component: page(() => import("./pages/signup-complete.vue")),
}, {
    path: "/announcements",
    component: page(() => import("./pages/announcements.vue")),
}, {
    path: "/about",
    component: page(() => import("./pages/about.vue")),
    hash: "initialTab",
}, {
    path: "/ads",
    component: page(() => import("./pages/ads.vue")),
}, {
    path: "/theme-editor",
    component: page(() => import("./pages/theme-editor.vue")),
    loginRequired: true,
}, {
    path: "/explore/tags/:tag",
    component: page(() => import("./pages/explore.vue")),
}, {
    path: "/explore",
    component: page(() => import("./pages/explore.vue")),
}, {
    path: "/search",
    component: page(() => import("./pages/search.vue")),
    query: {
        q: "query",
        channel: "channel",
    },
}, {
    path: "/authorize-follow",
    component: page(() => import("./pages/follow.vue")),
    loginRequired: true,
}, {
    path: "/share",
    component: page(() => import("./pages/share.vue")),
    loginRequired: true,
}, {
    path: "/api-console",
    component: page(() => import("./pages/api-console.vue")),
    loginRequired: true,
}, {
    path: "/mfm-cheat-sheet",
    component: page(() => import("./pages/mfm-cheat-sheet.vue")),
}, {
    path: "/preview",
    component: page(() => import("./pages/preview.vue")),
}, {
    path: "/auth/:token",
    component: page(() => import("./pages/auth.vue")),
}, {
    path: "/miauth/:session",
    component: page(() => import("./pages/miauth.vue")),
    query: {
        callback: "callback",
        name: "name",
        icon: "icon",
        permission: "permission",
    },
}, {
    path: "/tags/:tag",
    component: page(() => import("./pages/tag.vue")),
}, {
    path: "/registry/keys/system/:path(*)?",
    component: page(() => import("./pages/registry.keys.vue")),
}, {
    path: "/registry/value/system/:path(*)?",
    component: page(() => import("./pages/registry.value.vue")),
}, {
    path: "/registry",
    component: page(() => import("./pages/registry.vue")),
}, {
    path: "/admin/file/:fileId",
    component: iAmModerator ? page(() => import("./pages/admin-file.vue")) : page(() => import("./pages/not-found.vue")),
}, {
    path: "/admin",
    component: iAmModerator ? page(() => import("./pages/admin/index.vue")) : page(() => import("./pages/not-found.vue")),
    children: [{
        path: "/overview",
        name: "overview",
        component: page(() => import("./pages/admin/overview.vue")),
    }, {
        path: "/users",
        name: "users",
        component: page(() => import("./pages/admin/users.vue")),
    }, {
        path: "/emojis",
        name: "emojis",
        component: page(() => import("./pages/admin/emojis.vue")),
    }, {
        path: "/queue",
        name: "queue",
        component: page(() => import("./pages/admin/queue.vue")),
    }, {
        path: "/files",
        name: "files",
        component: page(() => import("./pages/admin/files.vue")),
    }, {
        path: "/announcements",
        name: "announcements",
        component: page(() => import("./pages/admin/announcements.vue")),
    }, {
        path: "/database",
        name: "database",
        component: page(() => import("./pages/admin/database.vue")),
    }, {
        path: "/abuses",
        name: "abuses",
        component: page(() => import("./pages/admin/abuses.vue")),
    }, {
        path: "/moderation-logs",
        name: "moderation-logs",
        component: page(() => import("./pages/admin/moderation-logs.vue")),
    }, {
        path: "/settings",
        name: "settings",
        component: iAmAdmin ? page(() => import("./pages/admin/settings.vue")) : page(() => import("./pages/not-found.vue")),
    }, {
        path: "/object-storage",
        name: "object-storage",
        component: iAmAdmin ? page(() => import("./pages/admin/object-storage.vue")) : page(() => import("./pages/not-found.vue")),
    }, {
        path: "/security",
        name: "security",
        component: iAmAdmin ? page(() => import("./pages/admin/security.vue")) : page(() => import("./pages/not-found.vue")),
    }, {
        path: "/instance-block",
        name: "instance-block",
        component: iAmAdmin ? page(() => import("./pages/admin/instance-block.vue")) : page(() => import("./pages/not-found.vue")),
    }, {
        path: "/proxy-account",
        name: "proxy-account",
        component: iAmAdmin ? page(() => import("./pages/admin/proxy-account.vue")) : page(() => import("./pages/not-found.vue")),
    }, {
        path: "/other-settings",
        name: "other-settings",
        component: iAmAdmin ? page(() => import("./pages/admin/other-settings.vue")) : page(() => import("./pages/not-found.vue")),
    }, {
        path: "/",
        component: page(() => import("./pages/_empty_.vue")),
    }],
}, {
    path: "/my/notifications",
    component: page(() => import("./pages/notifications.vue")),
    loginRequired: true,
}, {
    path: "/my/drive/folder/:folder",
    component: page(() => import("./pages/drive.vue")),
    loginRequired: true,
}, {
    path: "/my/drive",
    component: page(() => import("./pages/drive.vue")),
    loginRequired: true,
}, {
    path: "/my/follow-requests",
    component: page(() => import("./pages/follow-requests.vue")),
    loginRequired: true,
}, {
    path: "/my/lists/:listId",
    component: page(() => import("./pages/my-lists/list.vue")),
    loginRequired: true,
}, {
    path: "/my/lists",
    component: page(() => import("./pages/my-lists/index.vue")),
    loginRequired: true,
}, {
    path: "/my/clips",
    component: page(() => import("./pages/my-clips/index.vue")),
    loginRequired: true,
}, {
    path: "/my/antennas/create",
    component: page(() => import("./pages/my-antennas/create.vue")),
    loginRequired: true,
}, {
    path: "/my/antennas/:antennaId",
    component: page(() => import("./pages/my-antennas/edit.vue")),
    loginRequired: true,
}, {
    path: "/my/antennas",
    component: page(() => import("./pages/my-antennas/index.vue")),
    loginRequired: true,
}, {
    path: "/timeline/list/:listId",
    component: page(() => import("./pages/user-list-timeline.vue")),
    loginRequired: true,
}, {
    path: "/timeline/antenna/:antennaId",
    component: page(() => import("./pages/antenna-timeline.vue")),
    loginRequired: true,
}, {
    name: "index",
    path: "/",
    component: $i ? page(() => import("./pages/timeline.vue")) : page(() => import("./pages/welcome.vue")),
    globalCacheKey: "index",
}, {
    path: "/:(*)",
    component: page(() => import("./pages/not-found.vue")),
}];

export const mainRouter = new Router(routes, location.pathname + location.search + location.hash);

window.history.replaceState({ key: mainRouter.getCurrentKey() }, "", location.href);

// TODO: このファイルでスクロール位置も管理する設計だとdeckに対応できないのでなんとかする
// スクロール位置取得+スクロール位置設定関数をprovideする感じでも良いかも

const scrollPosStore = new Map<string, number>();

window.setInterval(() => {
    scrollPosStore.set(window.history.state?.key, window.scrollY);
}, 1000);

mainRouter.addListener("push", ctx => {
    window.history.pushState({ key: ctx.key }, "", ctx.path);
    const scrollPos = scrollPosStore.get(ctx.key) ?? 0;
    window.scroll({ top: scrollPos, behavior: "instant" });
    if (scrollPos !== 0) {
        window.setTimeout(() => { // 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
            window.scroll({ top: scrollPos, behavior: "instant" });
        }, 100);
    }
});

mainRouter.addListener("replace", ctx => {
    window.history.replaceState({ key: ctx.key }, "", ctx.path);
});

mainRouter.addListener("same", () => {
    window.scroll({ top: 0, behavior: "smooth" });
});

window.addEventListener("popstate", (event) => {
    mainRouter.replace(location.pathname + location.search + location.hash, event.state?.key, false);
    const scrollPos = scrollPosStore.get(event.state?.key) ?? 0;
    window.scroll({ top: scrollPos, behavior: "instant" });
    window.setTimeout(() => { // 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
        window.scroll({ top: scrollPos, behavior: "instant" });
    }, 100);
});

export function useRouter(): Router {
    return inject<Router | null>("router", null) ?? mainRouter;
}
