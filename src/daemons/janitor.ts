// TODO: 消したい

const interval = 30 * 60 * 1000;
import { LessThan } from "typeorm";
import { AttestationChallenges } from "@/models/index.js";

/**
 * Clean up database occasionally
 */
export default function() {
    async function tick() {
        await AttestationChallenges.delete({
            createdAt: LessThan(new Date(new Date().getTime() - 5 * 60 * 1000)),
        });
    }

    tick();

    setInterval(tick, interval);
}
