import Bull from "bull";
import { checkExpiredMutings } from "./check-expired-mutings.js";
import { clean } from "./clean.js";

const jobs = {
    checkExpiredMutings,
    clean,
} as Record<string, Bull.ProcessCallbackFunction<Record<string, unknown>> | Bull.ProcessPromiseFunction<Record<string, unknown>>>;

export default function(dbQueue: Bull.Queue<Record<string, unknown>>) {
    for (const [k, v] of Object.entries(jobs)) {
        dbQueue.process(k, v);
    }
}
