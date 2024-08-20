import { beforeShutdown } from "@/misc/before-shutdown.js";

import FederationChart from "./charts/federation.js";
import NotesChart from "./charts/notes.js";
import UsersChart from "./charts/users.js";
import ActiveUsersChart from "./charts/active-users.js";
import InstanceChart from "./charts/instance.js";
import PerUserNotesChart from "./charts/per-user-notes.js";
import ApRequestChart from "./charts/ap-request.js";

export const federationChart = new FederationChart();
export const notesChart = new NotesChart();
export const usersChart = new UsersChart();
export const activeUsersChart = new ActiveUsersChart();
export const instanceChart = new InstanceChart();
export const perUserNotesChart = new PerUserNotesChart();
export const apRequestChart = new ApRequestChart();

const charts = [
    federationChart,
    notesChart,
    usersChart,
    activeUsersChart,
    instanceChart,
    perUserNotesChart,
    apRequestChart,
];

// 20分おきにメモリ情報をDBに書き込み
setInterval(() => {
    for (const chart of charts) {
        chart.save();
    }
}, 1000 * 60 * 20);

beforeShutdown(() => Promise.all(charts.map(chart => chart.save())));
