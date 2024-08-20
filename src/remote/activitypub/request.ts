import config from "@/config/index.js";
import { getUserKeypair } from "@/misc/keypair-store.js";
import { User, ILocalUser } from "@/models/entities/user.js";
import { StatusError, getResponse } from "@/misc/fetch.js";
import { isValidUrl } from "@/misc/is-valid-url.js";
import { createSignedPost, createSignedGet } from "./ap-request.js";
import { IObject } from "./type.js";
import type { Response } from "node-fetch";

export default async (user: { id: User["id"] }, url: string, object: any) => {
    const body = JSON.stringify(object);

    const keypair = await getUserKeypair(user.id);

    const req = createSignedPost({
        key: {
            privateKeyPem: keypair.privateKey,
            keyId: `${config.url}/users/${user.id}#main-key`,
        },
        url,
        body,
        additionalHeaders: {
            "User-Agent": config.userAgent,
        },
    });

    await getResponse({
        url,
        method: req.request.method,
        headers: req.request.headers,
        body,
    });
};

/**
 * Get ActivityPub object
 * @param user http-signature user
 * @param url URL to fetch
 */

export async function apGet(url: string, user?: ILocalUser): Promise<IObject> {
    if (!isValidUrl(url)) {
        throw new StatusError("Invalid URL", 400);
    }

    let res: Response;
	
    if (user != null) {
        const keypair = await getUserKeypair(user.id);
        const req = createSignedGet({
            key: {
                privateKeyPem: keypair.privateKey,
                keyId: `${config.url}/users/${user.id}#main-key`,
            },
            url,
            additionalHeaders: {
                "User-Agent": config.userAgent,
            },
        });

        res = await getResponse({
            url,
            method: req.request.method,
            headers: req.request.headers,
        });
    } else {
        res = await getResponse({
            url,
            method: "GET",
            headers: {
                Accept:
					"application/activity+json, application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"",
                "User-Agent": config.userAgent,
            },
        });
    }

    const contentType = res.headers.get("content-type");
    if (contentType == null || !validateContentType(contentType)) {
        throw new Error("Invalid Content Type");
    }

    if (res.body == null) throw new Error("body is null");

    const text = await res.text();
    if (text.length > 65536) throw new Error("too big result");

    return JSON.parse(text) as IObject;
}

function validateContentType(contentType: string): boolean {
    const parts = contentType.split(/\s*;\s*/);
    if (parts[0] === "application/activity+json") return true;
    if (parts[0] !== "application/ld+json") return false;
    return parts
		.slice(1)
		.some(
		    (part) =>
		        part.trim() === "profile=\"https://www.w3.org/ns/activitystreams\"",
		);
}
