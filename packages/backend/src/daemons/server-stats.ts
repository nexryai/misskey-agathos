import Xev from "xev";
import * as osUtils from "os-utils";
import * as process from "node:process";
import { readFile } from "node:fs";

const ev = new Xev();

const interval = 2000;

const roundCpu = (num: number) => Math.round(num * 1000) / 1000;
const round = (num: number) => Math.round(num * 10) / 10;

/**
 * Report server stats regularly
 */
export default function() {
    const log = [] as any[];

    ev.on("requestServerStatsLog", x => {
        ev.emit(`serverStatsLog:${x.id}`, log.slice(0, x.length || 50));
    });

    async function tick() {
        const cpu = await cpuUsage();
        const memUsage = (await getMemoryUsage() || 0) / 1024 / 1024;

        const stats = {
            cpu: roundCpu(cpu),
            mem: {
                used: round(memUsage),
                usage: round((memUsage / osUtils.totalmem()) * 100),
            },
        };
        ev.emit("serverStats", stats);
        log.unshift(stats);
        if (log.length > 200) log.pop();
    }

    tick();

    setInterval(tick, interval);
}

// CPU STAT
function cpuUsage(): Promise<number> {
    return new Promise((res, rej) => {
        osUtils.cpuUsage((cpuUsage) => {
            res(cpuUsage);
        });
    });
}

function getMemoryUsage(): Promise<number | null> {
    if (process.platform === "linux") {
        return getAvailableMemoryFromProc();
    } else {
        // 現在のプロセスのメモリ使用量にフォールバック
        return new Promise((resolve) => {
            resolve(process.memoryUsage().rss);
        });
    }
}

function getAvailableMemoryFromProc(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        readFile("/proc/meminfo", (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const dataStr = data.toString();
            const lines = dataStr.split("\n");
            const memAvailableLine = lines.find(line => line.startsWith("MemAvailable"));

            if (!memAvailableLine) {
                reject(new Error("MemAvailable not found in proc: maybe your kernel is too old?"));
                return;
            }

            const matches = memAvailableLine.match(/(\d+)\s+(\w+)/);
            if (!matches || matches.length !== 3) {
                reject(new Error("Failed to parse: invalid MemAvailable value"));
                return;
            }

            const value = parseInt(matches[1], 10);
            const unit = matches[2].toLowerCase();

            try {
                let valueInBytes;
                switch (unit) {
                    case "kb":
                        valueInBytes = value * 1024;
                        break;
                    case "mb":
                        valueInBytes = value * 1024 * 1024;
                        break;
                    case "gb":
                        valueInBytes = value * 1024 * 1024 * 1024;
                        break;
                    default:
                        reject(new Error("Unknown unit: " + unit));
                        return;
                }
                resolve(valueInBytes);
            } catch (error) {
                reject(error);
            }
        });
    });
}
