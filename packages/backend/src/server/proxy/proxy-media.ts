import { readFile } from "fs/promises";
import Koa from "koa";
import { IImage, convertToWebp } from "@/services/drive/image-processor.js";
import { createTemp } from "@/misc/create-temp.js";
import { downloadUrl } from "@/misc/download-url.js";
import { detectType } from "@/misc/get-file-info.js";
import { StatusError } from "@/misc/fetch.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";
import { isMimeImage } from "@/misc/is-mime-image.js";
import { serverLogger } from "../index.js";

 
export async function proxyMedia(ctx: Koa.Context) {
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
                data: await readFile(path),
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
}
