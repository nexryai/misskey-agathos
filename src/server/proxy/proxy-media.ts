import * as fs from "node:fs";
import * as querystring from "querystring";
import Koa from "koa";
import config from "@/config/index.js";
import { IImage, convertToWebp } from "@/services/drive/image-processor.js";
import { createTemp } from "@/misc/create-temp.js";
import { downloadUrl } from "@/misc/download-url.js";
import { detectType } from "@/misc/get-file-info.js";
import { StatusError } from "@/misc/fetch.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";
import { isMimeImage } from "@/misc/is-mime-image.js";
import { serverLogger } from "../index.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function proxyMedia(ctx: Koa.Context) {
    let redirectUrl: string;

    if (config.mediaProxy == null || ctx.query.mustOrigin === "1") {
        // MediaProxyを使わない場合
        const url = "url" in ctx.query ? ctx.query.url : "https://" + ctx.params.url;

        if (typeof url !== "string") {
            ctx.status = 400;
            return;
        }

        // Create temp file
        const [path, cleanup] = await createTemp();

        try {
            await downloadUrl(url, path);

            const { mime, ext } = await detectType(path);
            const isConvertibleImage = isMimeImage(mime, "sharp-convertible-image");

            let image: IImage;

            if ("static" in ctx.query && isConvertibleImage) {
                image = await convertToWebp(path, 498, 280);
            } else if ("preview" in ctx.query && isConvertibleImage) {
                image = await convertToWebp(path, 200, 200);
            } else if ("avatar" in ctx.query && isConvertibleImage) {
                image = await convertToWebp(path, 320, 320);
            } else if ("ticker" in ctx.query && isConvertibleImage) {
                image = await convertToWebp(path, 64, 64);
            } else if ("thumbnail" in ctx.query && isConvertibleImage) {
                image = await convertToWebp(path, 500, 400);
            } else if ("badge" in ctx.query && isConvertibleImage) {
                image = await convertToWebp(path, 96, 96);
            } else if (mime === "image/svg+xml") {
                image = await convertToWebp(path, 2048, 2048, 1);
            } else if (!mime.startsWith("image/") || !FILE_TYPE_BROWSERSAFE.includes(mime)) {
                throw new StatusError("Rejected type", 403, "Rejected type");
            } else {
                image = {
                    data: fs.readFileSync(path),
                    ext,
                    type: mime,
                };
            }

            ctx.set("Content-Type", image.type);
            ctx.set("Cache-Control", "max-age=31536000, immutable");
            ctx.body = image.data;
        } catch (e) {
            serverLogger.error(`${e}`);

            if (e instanceof StatusError && (e.statusCode === 302 || e.isClientError)) {
                ctx.status = e.statusCode;
            } else {
                ctx.status = 500;
            }
        } finally {
            cleanup();
        }
    } else {
        // 外部のMediaProxyを使うはずなのにこっちに誘導されたならリダイレクト
        redirectUrl = config.mediaProxy;

        // パスとパラメータを取得
        const { path, query } = ctx.request;

        let imageUrl = query.url;
        if (imageUrl == null) {
            ctx.status = 400;
            return;
        }

        // urlクエリにconfig.mediaProxyが含まれている場合imageUrlを復元
        if (imageUrl.includes(config.mediaProxy)) {
            imageUrl = (new URL(imageUrl instanceof Array ? imageUrl[0] : imageUrl)).searchParams.get("url") ?? imageUrl;
        }

        // サポートするクエリ
        const supportedQueries = ["preview", "emoji", "avatar", "ticker", "thumbnail"];

        // 対応するクエリが1の場合にtargetUrlに追加
        const additionalQueries = supportedQueries.filter(queryName => query[queryName] === "1");
        const additionalQueryString = additionalQueries.length > 0 ? `&${additionalQueries.join("&")}` : "";
        const targetUrl = redirectUrl + path + `?url=${imageUrl}${additionalQueryString}=1`;

        ctx.redirect(targetUrl);
    }
}
