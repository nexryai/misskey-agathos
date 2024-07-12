import Xev from "xev";
import * as osUtils from "os-utils";
import * as process from "node:process";

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

        const stats = {
            cpu: roundCpu(cpu),
            mem: {
                used: round(process.memoryUsage().rss / 1024 / 1024),
                usage: round(((process.memoryUsage().rss / 1024 / 1024) / osUtils.totalmem()) * 100),
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
