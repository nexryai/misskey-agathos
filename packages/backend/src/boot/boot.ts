import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import * as os from "node:os";
import chalk from "chalk";
import chalkTemplate from "chalk-template";

import Logger from "@/services/logger.js";
import loadConfig from "@/config/load.js";
import { Config } from "@/config/types.js";
import { showMachineInfo } from "@/misc/show-machine-info.js";
import { envOption } from "@/env.js";
import { db, initDb } from "@/db/postgre.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const meta = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/meta.json`, "utf-8"));

const logger = new Logger("core", "cyan");
const bootLogger = logger.createSubLogger("boot", "magenta", false);

const themeColor = chalk.hex("#86b300");

function greet(): void {
    if (!envOption.quiet) {
        //#region Misskey logo
        const v = `v${meta.version}`;
        console.log(themeColor("                 _              "));
        console.log(themeColor(" _ __   _____  _| | _____ _   _ "));
        console.log(themeColor("| '_ \\ / _ \\ \\/ / |/ / _ \\ | | |"));
        console.log(themeColor("| | | |  __/>  <|   <  __/ |_| |"));
        console.log(themeColor("|_| |_|\\___/_/\\_\\_|\\_\\___|\\__, |"));
        console.log(" " + chalk.gray(v) + themeColor("                         |___/ \n".substr(v.length)));
        //#endregion

        console.log(" Nexkey is an open-source decentralized microblogging platform.");

        console.log("");
        console.log(chalkTemplate`--- ${os.hostname()} {gray (PID: ${process.pid.toString()})} ---`);
    }

    bootLogger.info("Welcome to Nexkey!");
    bootLogger.info(`Nexkey v${meta.version}`, null, true);
}

/**
 * Init master process
 */
export async function startServer(): Promise<void> {
    let config!: Config;

    // initialize app
    try {
        greet();
        showEnvironment();
        await showMachineInfo(bootLogger);
        showNodejsVersion();
        config = loadConfigBoot();
        await connectDb();
    } catch (e) {
        bootLogger.error("Fatal error occurred during initialization", null, true);
        process.exit(1);
    }

    bootLogger.succ("initialized");

    if (!config.onlyQueueProcessor) {
        // start server
        await import("../server/index.js").then((x) => x.default());
    }

    if (!config.disableQueueProcessor) {
        // start job queue
        import("../queue/index.js").then(x => x.default());
    }

    bootLogger.succ(`Now listening on port ${config.port} on ${config.url}`, null, true);

    if (!envOption.noDaemons && !config.onlyQueueProcessor) {
        import("../daemons/server-stats.js").then(x => x.default());
        import("../daemons/queue-stats.js").then(x => x.default());
        import("../daemons/janitor.js").then(x => x.default());
    }
}

function showEnvironment(): void {
    const env = process.env.NODE_ENV;
    const logger = bootLogger.createSubLogger("env");
    logger.info(typeof env === "undefined" ? "NODE_ENV is not set" : `NODE_ENV: ${env}`);

    if (env !== "production") {
        logger.warn("The environment is not in production mode.");
        logger.warn("DO NOT USE FOR PRODUCTION PURPOSE!", null, true);
    }
}

function showNodejsVersion(): void {
    const nodejsLogger = bootLogger.createSubLogger("nodejs");

    nodejsLogger.info(`Version ${process.version} detected.`);
}

function loadConfigBoot(): Config {
    const configLogger = bootLogger.createSubLogger("config");
    let config;

    try {
        config = loadConfig();
    } catch (exception) {
        if (typeof exception === "string") {
            configLogger.error(exception);
            process.exit(1);
        }

        throw exception;
    }

    configLogger.succ("Loaded");

    return config;
}

async function connectDb(): Promise<void> {
    const dbLogger = bootLogger.createSubLogger("db");

    // Try to connect to DB
    try {
        dbLogger.info("Connecting...");
        await initDb();
        const v = await db.query("SHOW server_version").then(x => x[0].server_version);
        dbLogger.succ(`Connected: v${v}`);
    } catch (e) {
        dbLogger.error("Cannot connect", null, true);

        // @ts-ignore
        dbLogger.error(e);

        process.exit(1);
    }
}
