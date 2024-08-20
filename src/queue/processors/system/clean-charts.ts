import Bull from "bull";

import { activeUsersChart, federationChart, instanceChart, notesChart, perUserNotesChart, usersChart, apRequestChart } from "@/services/chart/index.js";
import { queueLogger } from "../../logger.js";

const logger = queueLogger.createSubLogger("clean-charts");

export async function cleanCharts(job: Bull.Job<Record<string, unknown>>, done: any): Promise<void> {
    logger.info("Clean charts...");

    await Promise.all([
        federationChart.clean(),
        notesChart.clean(),
        usersChart.clean(),
        activeUsersChart.clean(),
        instanceChart.clean(),
        perUserNotesChart.clean(),
        apRequestChart.clean(),
    ]);

    logger.succ("All charts successfully cleaned.");
    done();
}
