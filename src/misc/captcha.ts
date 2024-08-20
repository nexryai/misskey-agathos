import { URLSearchParams } from "node:url";
import fetch from "node-fetch";
import config from "@/config/index.js";
import { getAgentByUrl } from "./fetch.js";

export async function verifyRecaptcha(secret: string, response: string) {
    const result = await getCaptchaResponse("https://www.recaptcha.net/recaptcha/api/siteverify", secret, response).catch(e => {
        throw `recaptcha-request-failed: ${e}`;
    });

    if (result.success !== true) {
        const errorCodes = result["error-codes"] ? result["error-codes"].join(", ") : "";
        throw `recaptcha-failed: ${errorCodes}`;
    }
}

export async function verifyHcaptcha(secret: string, response: string) {
    const result = await getCaptchaResponse("https://hcaptcha.com/siteverify", secret, response).catch(e => {
        throw `hcaptcha-request-failed: ${e}`;
    });

    if (result.success !== true) {
        const errorCodes = result["error-codes"] ? result["error-codes"].join(", ") : "";
        throw `hcaptcha-failed: ${errorCodes}`;
    }
}

export async function verifyTurnstile(secret: string, response: string) {
    const result = await getCaptchaResponse("https://challenges.cloudflare.com/turnstile/v0/siteverify", secret, response).catch(e => {
        throw `turnstile-request-failed: ${e}`;
    });

    if (result.success !== true) {
        const errorCodes = result["error-codes"] ? result["error-codes"].join(", ") : "";
        throw `turnstile-failed: ${errorCodes}`;
    }
}

type CaptchaResponse = {
	success: boolean;
	"error-codes"?: string[];
};

async function getCaptchaResponse(url: string, secret: string, response: string): Promise<CaptchaResponse> {
    const params = new URLSearchParams({
        secret,
        response,
    });

    const res = await fetch(url, {
        method: "POST",
        body: params,
        headers: {
            "User-Agent": config.userAgent,
        },
        // TODO
        //timeout: 10 * 1000,
        agent: getAgentByUrl,
    }).catch(e => {
        throw `${e.message || e}`;
    });

    if (!res.ok) {
        throw `${res.status}`;
    }

    return await res.json() as CaptchaResponse;
}
