import Bull from "bull";

import { notesChart, usersChart } from "@/services/chart/index.js";
import { queueLogger } from "../../logger.js";

const logger = queueLogger.createSubLogger("resync-charts");

export async function resyncCharts(job: Bull.Job<Record<string, unknown>>, done: any): Promise<void> {
    logger.info("Resync charts...");

    // TODO: ユーザーごとのチャートも更新する
    // TODO: インスタンスごとのチャートも更新する
    await Promise.all([
        notesChart.resync(),
        usersChart.resync(),
    ]);

    logger.succ("All charts successfully resynced.");
    done();
}
