import Koa from "koa";
import { fetchMeta } from "@/misc/fetch-meta.js";
import Logger from "@/services/logger.js";
import config from "@/config/index.js";
import { query } from "@/prelude/url.js";
import { getJson } from "@/misc/fetch.js";
import { sanitizeUrl } from "@/misc/sanitize-url.js";

const logger = new Logger("url-preview");

interface Summary {
	title: string;
	icon?: string;
	thumbnail?: string;
	player?: {
		url: string;
	};
	url: string;
}

export const urlPreviewHandler = async (ctx: Koa.Context) => {
    const url = ctx.query.url;
    if (typeof url !== "string") {
        ctx.status = 400;
        return;
    }

    const lang = ctx.query.lang;
    if (Array.isArray(lang)) {
        ctx.status = 400;
        return;
    }

    const meta = await fetchMeta();

    logger.info(meta.summalyProxy
        ? `(Proxy) Getting preview of ${url}@${lang} ...`
        : `Getting preview of ${url}@${lang} ...`);

    try {
        // DDoS状態になるのはアレなので強制的にどっかしらのプロキシを使うようにする
        let summalyProxy = meta.summalyProxy;
        if (summalyProxy == null) {
            summalyProxy = "https://summaly.sda1.net";
        }

        const summary: Summary = await getJson(`${summalyProxy}?${query({
            url: url,
            lang: lang ?? "ja-JP",
        })}`) as Summary;

        logger.succ(`Got preview of ${url}: ${summary.title}`);

        summary.icon = wrap(summary.icon);
        summary.thumbnail = wrap(summary.thumbnail);

        if (summary.player) summary.player.url = sanitizeUrl(summary.player.url);
        summary.url = sanitizeUrl(summary.url);

        // Cache 7days
        ctx.set("Cache-Control", "max-age=604800, immutable");

        ctx.body = summary;
    } catch (err) {
        logger.warn(`Failed to get preview of ${url}: ${err}`);
        ctx.status = 200;
        ctx.set("Cache-Control", "max-age=86400, immutable");
        ctx.body = "{}";
    }
};

function wrap(url: string | null) {
    if (url == null) return null;

    if (url.match(/^https?:/)) {
        return `${config.url}/proxy/preview.webp?${query({
            url,
            preview: "1",
        })}`;
    }

    if (url.match(/^data:/)) {
        return url;
    }

    return null;
}
