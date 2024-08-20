import cluster from "node:cluster";
import Xev from "xev";

import Logger from "@/services/logger.js";
import { envOption } from "../env.js";

// for typeorm
import "reflect-metadata";
import { startServer } from "./boot.js";

const logger = new Logger("core", "cyan");
const ev = new Xev();

/**
 * Init process
 */
export default async function() {
    process.title = "Nexkey Server";

    await startServer();

    if (cluster.isPrimary) {
        ev.mount();
    }

    // ユニットテスト時にMisskeyが子プロセスで起動された時のため
    // それ以外のときは process.send は使えないので弾く
    if (process.send) {
        process.send("ok");
    }
}

//#region Events

// Display detail of unhandled promise rejection
if (!envOption.quiet) {
    process.on("unhandledRejection", console.dir);
}

// Display detail of uncaught exception
process.on("uncaughtException", err => {
    try {
        logger.error(err);
    } catch {
        // do nothing
    }
});

// Dying away...
process.on("exit", code => {
    logger.info(`The process is going to exit with code ${code}`);
});

//#endregion
