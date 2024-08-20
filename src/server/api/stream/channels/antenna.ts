import { Notes } from "@/models/index.js";
import { isUserRelated } from "@/misc/is-user-related.js";
import Channel from "../channel.js";
import { StreamMessages } from "../types.js";

export default class extends Channel {
    public readonly chName = "antenna";
    public static shouldShare = false;
    public static requireCredential = false;
    private antennaId: string;

    constructor(id: string, connection: Channel["connection"]) {
        super(id, connection);
        this.onEvent = this.onEvent.bind(this);
    }

    public async init(params: any) {
        this.antennaId = params.antennaId as string;

        // Subscribe stream
        this.subscriber.on(`antennaStream:${this.antennaId}`, this.onEvent);
    }

    private async onEvent(data: StreamMessages["antenna"]["payload"]) {
        if (data.type === "note") {
            const note = await Notes.pack(data.body.id, this.user, { detail: true });

            // 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
            if (isUserRelated(note, this.muting)) return;
            // 流れてきたNoteがブロックされているユーザーが関わるものだったら無視する
            if (isUserRelated(note, this.blocking)) return;
            // リノートミュートされてたら無視
            if (note.renote && !note.text && isUserRelated(note, this.renoteMuting)) return;

            this.connection.cacheNote(note);

            this.send("note", note);
        } else {
            this.send(data.type, data.body);
        }
    }

    public dispose() {
        // Unsubscribe events
        this.subscriber.off(`antennaStream:${this.antennaId}`, this.onEvent);
    }
}
