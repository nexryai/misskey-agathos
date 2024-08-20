import * as os from "node:os";
import Logger from "@/services/logger.js";

export async function showMachineInfo(parentLogger: Logger) {
    const logger = parentLogger.createSubLogger("machine");
    logger.debug(`Hostname: ${os.hostname()}`);
    logger.debug(`Platform: ${process.platform} Arch: ${process.arch}`);
}
