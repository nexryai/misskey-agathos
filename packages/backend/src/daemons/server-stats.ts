import Xev from "xev";
import * as process from "node:process";
import { readFile } from "node:fs";
import * as os from "os";

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

    async function tick(): Promise<void> {
        const cpuUsage = await getCpuUsage();
        const memUsage = (await getMemoryUsage() || 0) / 1024 / 1024;

        const stats = {
            cpu: roundCpu(cpuUsage),
            mem: {
                used: round(memUsage),
                usage: round((memUsage / os.totalmem()) * 100),
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
function getCpuUsage(): Promise<number> {
    return new Promise((res, rej) => {
        try {
            const stats1 = getCpu();
            setTimeout(() => {
                const stats2 = getCpu();
                const idleDiff = stats2.idle - stats1.idle;
                const totalDiff = stats2.total - stats1.total;

                // Prevent division by zero
                if (totalDiff === 0) {
                    res(0);
                    return;
                }

                const usagePercent = 1 - idleDiff / totalDiff;
                res(usagePercent);
            }, 1000);
        } catch (e) {
            rej(e);
        }
    });
}

function getCpu(): { idle: number; total: number } {
    const cpus = os.cpus();
    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;

    for (const cpu of cpus) {
        if (!cpu.times) {
            continue;
        }

        user += cpu.times.user;
        nice += cpu.times.nice;
        sys += cpu.times.sys;
        idle += cpu.times.idle;
        irq += cpu.times.irq;
    }

    const total = user + nice + sys + idle + irq;
    return {
        idle,
        total,
    };
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
