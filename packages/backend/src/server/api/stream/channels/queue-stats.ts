import Xev from "xev";
import Channel from "../channel.js";

const ev = new Xev();

export default class extends Channel {
    public readonly chName = "queueStats";
    public static shouldShare = true;
    public static requireCredential = false;

    constructor(id: string, connection: Channel["connection"]) {
        super(id, connection);
        this.onStats = this.onStats.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    public async init(params: any) {
        ev.addListener("queueStats", this.onStats);
    }

    private onStats(stats: any) {
        this.send("stats", stats);
    }

    public onMessage(type: string, body: any) {
        switch (type) {
        case "requestLog":
            ev.once(`queueStatsLog:${body.id}`, statsLog => {
                this.send("statsLog", statsLog);
            });
            ev.emit("requestQueueStatsLog", {
                id: body.id,
                length: body.length,
            });
            break;
        }
    }

    public dispose() {
        ev.removeListener("queueStats", this.onStats);
    }
}
