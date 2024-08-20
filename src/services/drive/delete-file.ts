import { v4 as uuid } from "uuid";
import { IsNull } from "typeorm";
import { DriveFile } from "@/models/entities/drive-file.js";
import { DriveFiles, Emojis } from "@/models/index.js";
import { createDeleteObjectStorageFileJob } from "@/queue/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { InternalStorage } from "./internal-storage.js";
import { getS3 } from "./s3.js";

export async function deleteFile(file: DriveFile, isExpired = false) {
    if (file.webpublicUrl != null) {
        const emojis = await Emojis.findOneBy({
            host: IsNull(),
            publicUrl: file.webpublicUrl,
        });
        if (emojis != null) {
            return; // emojiのpublicUrlがfileに含まれている場合は処理をスキップ
        }
    } else if (file.url != null) {
        const emojis = await Emojis.findOneBy({
            host: IsNull(),
            publicUrl: file.url,
        });
        if (emojis != null) {
            return; // emojiのpublicUrlがfileに含まれている場合は処理をスキップ
        }
    }

    if (file.storedInternal) {
        InternalStorage.del(file.accessKey!);

        if (file.thumbnailUrl) {
            InternalStorage.del(file.thumbnailAccessKey!);
        }

        if (file.webpublicUrl) {
            InternalStorage.del(file.webpublicAccessKey!);
        }
    } else if (!file.isLink) {
        createDeleteObjectStorageFileJob(file.accessKey!);

        if (file.thumbnailUrl) {
            createDeleteObjectStorageFileJob(file.thumbnailAccessKey!);
        }

        if (file.webpublicUrl) {
            createDeleteObjectStorageFileJob(file.webpublicAccessKey!);
        }
    }

    postProcess(file, isExpired);
}

export async function deleteFileSync(file: DriveFile, isExpired = false) {
    if (file.webpublicUrl != null) {
        const emojis = await Emojis.findOneBy({
            host: IsNull(),
            publicUrl: file.webpublicUrl,
        });
        if (emojis != null) {
            return; // emojiのpublicUrlがfileに含まれている場合は処理をスキップ
        }
    } else if (file.url != null) {
        const emojis = await Emojis.findOneBy({
            host: IsNull(),
            publicUrl: file.url,
        });
        if (emojis != null) {
            return; // emojiのpublicUrlがfileに含まれている場合は処理をスキップ
        }
    }

    if (file.storedInternal) {
        InternalStorage.del(file.accessKey!);

        if (file.thumbnailUrl) {
            InternalStorage.del(file.thumbnailAccessKey!);
        }

        if (file.webpublicUrl) {
            InternalStorage.del(file.webpublicAccessKey!);
        }
    } else if (!file.isLink) {
        const promises = [];

        promises.push(deleteObjectStorageFile(file.accessKey!));

        if (file.thumbnailUrl) {
            promises.push(deleteObjectStorageFile(file.thumbnailAccessKey!));
        }

        if (file.webpublicUrl) {
            promises.push(deleteObjectStorageFile(file.webpublicAccessKey!));
        }

        await Promise.all(promises);
    }

    postProcess(file, isExpired);
}

async function postProcess(file: DriveFile, isExpired = false) {
    // リモートファイル期限切れ削除後は直リンクにする
    if (isExpired && file.userHost !== null && file.uri != null) {
        DriveFiles.update(file.id, {
            isLink: true,
            url: file.uri,
            thumbnailUrl: null,
            webpublicUrl: null,
            storedInternal: false,
            // ローカルプロキシ用
            accessKey: uuid(),
            thumbnailAccessKey: "thumbnail-" + uuid(),
            webpublicAccessKey: "webpublic-" + uuid(),
        });
    } else {
        DriveFiles.delete(file.id);
    }
}

export async function deleteObjectStorageFile(key: string) {
    const meta = await fetchMeta();

    const s3 = getS3(meta);

    await s3.deleteObject({
        Bucket: meta.objectStorageBucket!,
        Key: key,
    }).promise();
}
