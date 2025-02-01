import config from "@/config/index.js";
import { Notes, Polls, Users } from "@/models/index.js";
import { IPoll } from "@/models/entities/poll.js";
import { IRemoteUser } from "@/models/entities/user";
import Resolver from "../resolver.js";
import { getOneApId, IObject, isQuestion } from "../type.js";
import { apLogger } from "../logger.js";

export async function extractPollFromQuestion(source: string | IObject, resolver?: Resolver): Promise<IPoll> {
    if (resolver == null) resolver = new Resolver();

    const question = await resolver.resolve(source);

    if (!isQuestion(question)) {
        throw new Error("invalid type");
    }

    const multiple = !question.oneOf;
    const expiresAt = question.endTime ? new Date(question.endTime) : question.closed ? new Date(question.closed) : null;

    if (multiple && !question.anyOf) {
        throw new Error("invalid question");
    }

    const choices = question[multiple ? "anyOf" : "oneOf"]!
        .map((x, i) => x.name!);

    const votes = question[multiple ? "anyOf" : "oneOf"]!
        .map((x, i) => x.replies && x.replies.totalItems || x._misskey_votes || 0);

    if (choices.length > 10) {
        throw new Error("too many choices");
    }

    return {
        choices,
        votes,
        multiple,
        expiresAt,
    };
}

/**
 * Update votes of Question
 * @param uri URI of AP Question object
 * @returns true if updated
 */
export async function updateQuestion(value: any, actor?: IRemoteUser, resolver?: Resolver) {
    const uri = typeof value === "string" ? value : value.id;

    // URIがこのサーバーを指しているならスキップ
    if (uri.startsWith(config.url + "/")) throw new Error("uri points local");

    //#region このサーバーに既に登録されているか
    const note = await Notes.findOneBy({ uri });
    if (note == null) throw new Error("Question is not registed");

    const poll = await Polls.findOneBy({ noteId: note.id });
    if (poll == null) throw new Error("Question is not registed");

    const user = await Users.findOneBy({ id: poll.userId });
    if (user == null) throw new Error("Question is not registered");
    //#endregion

    // resolve new Question object
    if (resolver == null) resolver = new Resolver();
    const question = await resolver.resolve(value);
    apLogger.debug(`fetched question: ${JSON.stringify(question, null, 2)}`);

    if (!isQuestion(question)) throw new Error("object is not a Question");
    const attribution = (question.attributedTo) ? getOneApId(question.attributedTo) : user.uri;
    const attributionMatchesExisting = attribution === user.uri;
    const actorMatchesAttribution = (actor) ? attribution === actor.uri : true;
    if (!attributionMatchesExisting || !actorMatchesAttribution) {
        throw new Error("Refusing to ingest update for poll by different user");
    }

    const apChoices = question.oneOf || question.anyOf;

    let changed = false;

    for (const choice of poll.choices) {
        const oldCount = poll.votes[poll.choices.indexOf(choice)];
        const newCount = apChoices!.filter(ap => ap.name === choice)[0].replies!.totalItems;
        if (newCount == null || !(Number.isInteger(newCount) && newCount >= 0)) throw new Error("invalid newCount: " + newCount);

        if (oldCount !== newCount) {
            changed = true;
            poll.votes[poll.choices.indexOf(choice)] = newCount;
        }
    }

    await Polls.update({ noteId: note.id }, {
        votes: poll.votes,
    });

    return changed;
}
