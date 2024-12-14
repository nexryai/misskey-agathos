/**
 * Web Client Server
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import ms from "ms";
import Koa from "koa";
import Router from "@koa/router";
import send from "koa-send";
import favicon from "koa-favicon";
import views from "koa-views";
import sharp from "sharp";

import { In, IsNull } from "typeorm";
import { fetchMeta } from "@/misc/fetch-meta.js";
import config from "@/config/index.js";
import { Users, Notes, UserProfiles, Clips } from "@/models/index.js";
import * as Acct from "@/misc/acct.js";
import { getNoteSummary } from "@/misc/get-note-summary.js";
import { urlPreviewHandler } from "./url-preview.js";
import { manifestHandler } from "./manifest.js";
import packFeed from "./feed.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const staticAssets = `${_dirname}/../../../assets/`;
const clientAssets = `${_dirname}/../../../../client/assets/`;
const assets = `${_dirname}/../../../../../built/_client_dist_/`;

const allowedAssetsExt = [".js", ".css", ".map", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".avif", ".woff", ".woff2", ".ttf", ".eot", ".otf", "LICENSE"];

function isAllowedAssetExt(ctx: Koa.Context): boolean {
    const path = ctx.path;

    // ロケールファイルは許可
    if (path.startsWith("/assets/locales/") && path.includes("-") && path.endsWith(".json")) return true;

    return allowedAssetsExt.some(ext => path.endsWith(ext));
}

// 参考にした: https://github.com/mei23/misskey/blob/2c6db29a4acbce7e4ad8d40a54afc481019199ab/src/server/web/index.ts#L33
// ToDo: script-srcのunsafeを消せるようにする
export function genCsp(): {csp: string } {
    const csp
        = "base-uri 'none'; "
        + "default-src 'none'; "
        + "script-src 'self' 'unsafe-inline' https://www.recaptcha.net/recaptcha/ https://www.gstatic.com/recaptcha/ https://challenges.cloudflare.com; "
        + "img-src 'self' https: data: blob:; "
        + "media-src 'self' https:; "
        + "style-src 'self' 'unsafe-inline'; "
        + "font-src 'self'; "
        + "frame-src 'self' https:; "
        + "manifest-src 'self'; "
        + `connect-src 'self' data: blob: ${config.wsUrl}; `	// wssを指定しないとSafariで動かない https://github.com/w3c/webappsec-csp/issues/7#issuecomment-1086257826
        + "frame-ancestors 'none'";

    return { csp };
}

// Init app
const app = new Koa();

// Init renderer
app.use(views(_dirname + "/views", {
    extension: "pug",
    options: {
        version: config.version,
        getClientEntry: () => process.env.NODE_ENV === "production" ?
            config.clientEntry :
            JSON.parse(readFileSync(`${_dirname}/../../../../../built/_client_dist_/manifest.json`, "utf-8"))["src/init.ts"],
        config,
    },
}));

// Serve favicon
app.use(favicon(`${_dirname}/../../../assets/favicon.ico`));

// Common request handler
app.use(async (ctx, next) => {
    // IFrameの中に入れられないようにする
    ctx.set("X-Frame-Options", "DENY");
    await next();
});

// Init router
const router = new Router();

//#region static assets

router.get("/static-assets/(.*)", async ctx => {
    if (!isAllowedAssetExt(ctx)) {
        ctx.status = 404;
        return;
    }

    try {
        await send(ctx as any, ctx.path.replace("/static-assets/", ""), {
            root: staticAssets,
            maxage: ms("7 days"),
        });
    } catch (e) {
        ctx.status = 404;
    }
});

router.get("/client-assets/(.*)", async ctx => {
    if (!isAllowedAssetExt(ctx)) {
        ctx.status = 404;
        return;
    }

    try {
        await send(ctx as any, ctx.path.replace("/client-assets/", ""), {
            root: clientAssets,
            maxage: ms("7 days"),
        });
    } catch (e) {
        ctx.status = 404;
    }
});

router.get("/assets/(.*)", async ctx => {
    if (!isAllowedAssetExt(ctx)) {
        ctx.status = 404;
        return;
    }

    try {
        await send(ctx as any, ctx.path.replace("/assets/", ""), {
            root: assets,
            maxage: ms("7 days"),
        });
    } catch (e) {
        ctx.status = 404;
    }
});

// Apple touch icon
router.get("/apple-touch-icon.png", async ctx => {
    try {
        await send(ctx as any, "/apple-touch-icon.png", {
            root: staticAssets,
        });
    } catch (e) {
        ctx.status = 500;
    }
});

router.get("/twemoji/(.*)", async ctx => {
    const path = ctx.path.replace("/twemoji/", "");

    if (!path.match(/^[0-9a-f-]+\.svg$/)) {
        ctx.status = 404;
        return;
    }

    ctx.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");

    try {
        await send(ctx as any, path, {
            root: `${_dirname}/../../../node_modules/@discordapp/twemoji/dist/svg/`,
            maxage: ms("30 days"),
        });
    } catch (e) {
        ctx.status = 404;
    }
});

router.get("/twemoji-badge/(.*)", async ctx => {
    const path = ctx.path.replace("/twemoji-badge/", "");

    if (!path.match(/^[0-9a-f-]+\.png$/)) {
        ctx.status = 404;
        return;
    }

    const mask = await sharp(
        `${_dirname}/../../../node_modules/@discordapp/twemoji/dist/svg/${path.replace(".png", "")}.svg`,
        { density: 1000 },
    )
		.resize(488, 488)
		.greyscale()
		.normalise()
		.linear(1.75, -(128 * 1.75) + 128) // 1.75x contrast
		.flatten({ background: "#000" })
		.extend({
		    top: 12,
		    bottom: 12,
		    left: 12,
		    right: 12,
		    background: "#000",
		})
		.toColorspace("b-w")
		.png()
		.toBuffer();

    const buffer = await sharp({
        create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
		.pipelineColorspace("b-w")
		.boolean(mask, "eor")
		.resize(96, 96)
		.png()
		.toBuffer();

    ctx.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
    ctx.set("Cache-Control", "max-age=2592000");
    ctx.set("Content-Type", "image/png");
    ctx.body = buffer;
});

// Manifest
router.get("/manifest.json", manifestHandler);

router.get("/robots.txt", async ctx => {
    try {
        await send(ctx as any, "/robots.txt", {
            root: staticAssets,
        });
    } catch (e) {
        ctx.status = 500;
    }
});

//#endregion

// URL preview endpoint
router.get("/url", urlPreviewHandler);

const getFeed = async (acct: string) => {
    const { username, host } = Acct.parse(acct);
    const user = await Users.findOneBy({
        usernameLower: username.toLowerCase(),
        host: host ?? IsNull(),
        isSuspended: false,
    });

    return user && await packFeed(user);
};

// Atom
router.get("/@:user.atom", async ctx => {
    const feed = await getFeed(ctx.params.user);

    if (feed) {
        ctx.set("Content-Type", "application/atom+xml; charset=utf-8");
        ctx.body = feed.atom1();
    } else {
        ctx.status = 404;
    }
});

// RSS
router.get("/@:user.rss", async ctx => {
    const feed = await getFeed(ctx.params.user);

    if (feed) {
        ctx.set("Content-Type", "application/rss+xml; charset=utf-8");
        ctx.body = feed.rss2();
    } else {
        ctx.status = 404;
    }
});

// JSON
router.get("/@:user.json", async ctx => {
    const feed = await getFeed(ctx.params.user);

    if (feed) {
        ctx.set("Content-Type", "application/json; charset=utf-8");
        ctx.body = feed.json1();
    } else {
        ctx.status = 404;
    }
});

//#region SSR (for crawlers)
// User
router.get(["/@:user", "/@:user/:sub"], async (ctx, next) => {
    const { username, host } = Acct.parse(ctx.params.user);
    const user = await Users.findOneBy({
        usernameLower: username.toLowerCase(),
        host: host ?? IsNull(),
        isSuspended: false,
    });

    if (user != null) {
        const profile = await UserProfiles.findOneByOrFail({ userId: user.id });
        const meta = await fetchMeta();
        const me = profile.fields
            ? profile.fields
				.filter(filed => filed.value != null && filed.value.match(/^https?:/))
				.map(field => field.value)
            : [];

        const { csp } = genCsp();

        await ctx.render("user", {
            user, profile, me,
            avatarUrl: await Users.getAvatarUrl(user),
            sub: ctx.params.sub,
            instanceName: meta.name || "Misskey",
            icon: meta.iconUrl,
            themeColor: meta.themeColor,
        });

        ctx.set("Content-Security-Policy", csp);
        ctx.set("Cache-Control", "public, max-age=30");
    } else {
        // リモートユーザーなので
        // モデレータがAPI経由で参照可能にするために404にはしない
        await next();
    }
});

router.get("/users/:user", async ctx => {
    const user = await Users.findOneBy({
        id: ctx.params.user,
        host: IsNull(),
        isSuspended: false,
    });

    if (user == null) {
        ctx.status = 404;
        return;
    }

    ctx.redirect(`/@${user.username}${ user.host == null ? "" : "@" + user.host}`);
});

// Note
router.get("/notes/:note", async (ctx, next) => {
    const note = await Notes.findOneBy({
        id: ctx.params.note,
        visibility: In(["public", "home"]),
    });

    if (note) {
        const _note = await Notes.pack(note);
        const profile = await UserProfiles.findOneByOrFail({ userId: note.userId });
        const meta = await fetchMeta();
        const { csp } = genCsp();

        await ctx.render("note", {
            note: _note,
            profile,
            avatarUrl: await Users.getAvatarUrl(await Users.findOneByOrFail({ id: note.userId })),
            // TODO: Let locale changeable by instance setting
            summary: getNoteSummary(_note),
            instanceName: meta.name || "Misskey",
            icon: meta.iconUrl,
            themeColor: meta.themeColor,
        });

        ctx.set("Content-Security-Policy", csp);
        ctx.set("Cache-Control", "public, max-age=30");

        return;
    }

    await next();
});

// Clip
// TODO: 非publicなclipのハンドリング
router.get("/clips/:clip", async (ctx, next) => {
    const clip = await Clips.findOneBy({
        id: ctx.params.clip,
    });

    if (clip) {
        const _clip = await Clips.pack(clip);
        const profile = await UserProfiles.findOneByOrFail({ userId: clip.userId });
        const meta = await fetchMeta();
        const { csp } = genCsp();

        await ctx.render("clip", {
            clip: _clip,
            profile,
            avatarUrl: await Users.getAvatarUrl(await Users.findOneByOrFail({ id: clip.userId })),
            instanceName: meta.name || "Misskey",
            icon: meta.iconUrl,
            themeColor: meta.themeColor,
        });

        ctx.set("Content-Security-Policy", csp);
        ctx.set("Cache-Control", "public, max-age=15");

        return;
    }

    await next();
});

router.get("/_info_card_", async ctx => {
    const meta = await fetchMeta(true);

    ctx.remove("X-Frame-Options");

    await ctx.render("info-card", {
        version: config.version,
        host: config.host,
        meta: meta,
        originalUsersCount: await Users.countBy({ host: IsNull() }),
        originalNotesCount: await Notes.countBy({ userHost: IsNull() }),
    });
});

router.get("/bios", async ctx => {
    await ctx.render("bios", {
        version: config.version,
    });
});

router.get("/cli", async ctx => {
    await ctx.render("cli", {
        version: config.version,
    });
});

const override = (source: string, target: string, depth = 0) =>
    [, ...target.split("/").filter(x => x), ...source.split("/").filter(x => x).splice(depth)].join("/");

router.get("/flush", async ctx => {
    const { csp } = genCsp();
    await ctx.render("flush");
    ctx.set("Content-Security-Policy", csp);
});

// streamingに非WebSocketリクエストが来た場合にbase htmlをキャシュ付きで返すと、Proxy等でそのパスがキャッシュされておかしくなる
router.get("/streaming", async ctx => {
    ctx.status = 503;
    ctx.set("Cache-Control", "private, max-age=0");
});

// Render base html for all requests
router.get("(.*)", async ctx => {
    const meta = await fetchMeta();
    const { csp } = genCsp();

    await ctx.render("base", {
        img: meta.bannerUrl,
        title: meta.name || "Misskey",
        instanceName: meta.name || "Misskey",
        desc: meta.description,
        icon: meta.iconUrl,
        themeColor: meta.themeColor,
    });

    ctx.set("Content-Security-Policy", csp);
    ctx.set("Cache-Control", "public, max-age=30");
});

// Register router
app.use(router.routes());

export default app;
