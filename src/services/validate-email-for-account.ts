import { verifyEmail, isDisposableEmail } from "@devmehq/email-validator-js";
import extractDomain from "extract-domain";
import { UserProfiles } from "@/models/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";

export async function validateEmailForAccount(emailAddress: string): Promise<{
	available: boolean;
	reason: null | "used" | "format" | "disposable" | "mx" | "smtp" | "blocked";
}> {
    const meta = await fetchMeta();

    const exist = await UserProfiles.countBy({
        emailVerified: true,
        email: emailAddress,
    });

    let validated;

    const { validFormat, validMx } = await verifyEmail({ emailAddress: emailAddress, verifyMx: true, verifySmtp: false, timeout: 3000 });

    if (!validFormat) {
        validated = { valid: false, reason: "regex" };
    } else if (meta.enableActiveEmailValidation) {
        if (!validMx) {
            validated = { valid: false, reason: "mx" };
        } else if (isDisposableEmail(emailAddress)) {
            validated = { valid: false, reason: "disposable" };
        } else {
            validated = { valid: true };
        }
    } else {
        validated = { valid: true };
    }

    // メールドメインブロックを判定
    const domain = extractDomain(emailAddress).toLowerCase();
    let blockedEmailDomain = false;
    if (meta.blockedEmailDomains.some(x => domain.endsWith(x))) {
        blockedEmailDomain = true;
    }

    const available = exist === 0 && validated.valid && !blockedEmailDomain;

    return {
        available,
        reason: available ? null :
        exist !== 0 ? "used" :
        validated.reason === "regex" ? "format" :
        validated.reason === "disposable" ? "disposable" :
        validated.reason === "mx" ? "mx" :
        validated.reason === "smtp" ? "smtp" :
        blockedEmailDomain ? "blocked" :
        null,
    };
}
