import sharp from "sharp";
import Vips, { Image } from "wasm-vips";


export type IImage = {
	data: Buffer;
	ext: string | null;
	type: string;
};

/**
 * Convert to JPEG
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function convertToJpeg(path: string, width: number, height: number): Promise<IImage> {
    return convertSharpToJpeg(await sharp(path), width, height);
}

export async function convertSharpToJpeg(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
    const data = await sharp
        .resize(width, height, {
		    fit: "inside",
		    withoutEnlargement: true,
        })
        .rotate()
        .jpeg({
		    quality: 85,
		    progressive: true,
        })
        .toBuffer();

    return {
        data,
        ext: "jpg",
        type: "image/jpeg",
    };
}

/**
 * Convert to WebP
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function convertToWebp(path: string, width: number, height: number, quality = 75): Promise<IImage> {
    const vips = await Vips();
    vips.Cache.max(0);
    const image = vips.Image.newFromFile(path, {
        access: vips.Access.sequential,
    });

    return convertVipsToWebp(image, width, height, quality);
}

export async function convertVipsToWebp(image: Image, width: number, height: number, quality = 75): Promise<IImage> {
    // Resize
    const originalWidth = image.width;
    const originalHeight = image.height;

    const ratio = originalWidth / originalHeight;
    const targetRatio = width / height;

    const scale =
        ratio > targetRatio ?
            height < width ?
                height / originalHeight : width / originalWidth
            : 1;


    const resized = image.resize(scale);
    image.delete();

    const encoded = resized.webpsaveBuffer({
        Q: quality,
        lossless: false,
    });

    resized.delete();

    return {
        data: Buffer.from(encoded),
        ext: "webp",
        type: "image/webp",
    } as IImage;
}

export async function convertSharpToWebp(sharp: sharp.Sharp, width: number, height: number, quality = 85): Promise<IImage> {
    const data = await sharp
        .resize(width, height, {
		    fit: "inside",
		    withoutEnlargement: true,
        })
        .rotate()
        .webp({
		    quality,
        })
        .toBuffer();

    return {
        data,
        ext: "webp",
        type: "image/webp",
    };
}

/**
 * Convert to PNG
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function convertToPng(path: string, width: number, height: number): Promise<IImage> {
    return convertSharpToPng(await sharp(path), width, height);
}

export async function convertSharpToPng(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
    const data = await sharp
        .resize(width, height, {
		    fit: "inside",
		    withoutEnlargement: true,
        })
        .rotate()
        .png()
        .toBuffer();

    return {
        data,
        ext: "png",
        type: "image/png",
    };
}
