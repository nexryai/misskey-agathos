// https://github.com/typeorm/typeorm/issues/2400

// @ts-ignore
import pg from "pg";
pg.types.setTypeParser(20, Number);

import { Logger, DataSource } from "typeorm";
import * as highlight from "cli-highlight";
import config from "@/config/index.js";

import { User } from "@/models/entities/user.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import { DriveFolder } from "@/models/entities/drive-folder.js";
import { AccessToken } from "@/models/entities/access-token.js";
import { App } from "@/models/entities/app.js";
import { PollVote } from "@/models/entities/poll-vote.js";
import { Note } from "@/models/entities/note.js";
import { NoteReaction } from "@/models/entities/note-reaction.js";
import { NoteWatching } from "@/models/entities/note-watching.js";
import { NoteThreadMuting } from "@/models/entities/note-thread-muting.js";
import { NoteUnread } from "@/models/entities/note-unread.js";
import { Notification } from "@/models/entities/notification.js";
import { Meta } from "@/models/entities/meta.js";
import { Following } from "@/models/entities/following.js";
import { Instance } from "@/models/entities/instance.js";
import { Muting } from "@/models/entities/muting.js";
import { RenoteMuting } from "@/models/entities/renote-muting.js";
import { SwSubscription } from "@/models/entities/sw-subscription.js";
import { Blocking } from "@/models/entities/blocking.js";
import { UserList } from "@/models/entities/user-list.js";
import { UserListJoining } from "@/models/entities/user-list-joining.js";
import { Hashtag } from "@/models/entities/hashtag.js";
import { NoteFavorite } from "@/models/entities/note-favorite.js";
import { AbuseUserReport } from "@/models/entities/abuse-user-report.js";
import { RegistrationTicket } from "@/models/entities/registration-tickets.js";
import { Signin } from "@/models/entities/signin.js";
import { AuthSession } from "@/models/entities/auth-session.js";
import { FollowRequest } from "@/models/entities/follow-request.js";
import { Emoji } from "@/models/entities/emoji.js";
import { UserNotePining } from "@/models/entities/user-note-pining.js";
import { Poll } from "@/models/entities/poll.js";
import { UserKeypair } from "@/models/entities/user-keypair.js";
import { UserPublickey } from "@/models/entities/user-publickey.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { UserSecurityKey } from "@/models/entities/user-security-key.js";
import { AttestationChallenge } from "@/models/entities/attestation-challenge.js";
import { ModerationLog } from "@/models/entities/moderation-log.js";
import { UsedUsername } from "@/models/entities/used-username.js";
import { Announcement } from "@/models/entities/announcement.js";
import { AnnouncementRead } from "@/models/entities/announcement-read.js";
import { Clip } from "@/models/entities/clip.js";
import { ClipNote } from "@/models/entities/clip-note.js";
import { Antenna } from "@/models/entities/antenna.js";
import { AntennaNote } from "@/models/entities/antenna-note.js";
import { MutedNote } from "@/models/entities/muted-note.js";
import { RegistryItem } from "@/models/entities/registry-item.js";
import { PasswordResetRequest } from "@/models/entities/password-reset-request.js";
import { UserPending } from "@/models/entities/user-pending.js";
import { Webhook } from "@/models/entities/webhook.js";
import { UserIp } from "@/models/entities/user-ip.js";

import { dbLogger } from "./logger.js";
import { redisClient } from "./redis.js";

const sqlLogger = dbLogger.createSubLogger("sql", "gray", false);

class MyCustomLogger implements Logger {
    private highlight(sql: string) {
        return highlight.highlight(sql, {
            language: "sql", ignoreIllegals: true,
        });
    }

    public logQuery(query: string, parameters?: any[]) {
        sqlLogger.info(this.highlight(query).substring(0, 100));
    }

    public logQueryError(error: string, query: string, parameters?: any[]) {
        sqlLogger.error(this.highlight(query));
    }

    public logQuerySlow(time: number, query: string, parameters?: any[]) {
        sqlLogger.warn(this.highlight(query));
    }

    public logSchemaBuild(message: string) {
        sqlLogger.info(message);
    }

    public log(message: string) {
        sqlLogger.info(message);
    }

    public logMigration(message: string) {
        sqlLogger.info(message);
    }
}

export const entities = [
    Announcement,
    AnnouncementRead,
    Meta,
    Instance,
    App,
    AuthSession,
    AccessToken,
    User,
    UserProfile,
    UserKeypair,
    UserPublickey,
    UserList,
    UserListJoining,
    UserNotePining,
    UserSecurityKey,
    UsedUsername,
    AttestationChallenge,
    Following,
    FollowRequest,
    Muting,
    RenoteMuting,
    Blocking,
    Note,
    NoteFavorite,
    NoteReaction,
    NoteWatching,
    NoteThreadMuting,
    NoteUnread,
    DriveFile,
    DriveFolder,
    Poll,
    PollVote,
    Notification,
    Emoji,
    Hashtag,
    SwSubscription,
    AbuseUserReport,
    RegistrationTicket,
    Signin,
    ModerationLog,
    Clip,
    ClipNote,
    Antenna,
    AntennaNote,
    MutedNote,
    RegistryItem,
    PasswordResetRequest,
    UserPending,
    Webhook,
    UserIp,
];

const log = process.env.NODE_ENV !== "production";

export const db = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.pass,
    database: config.db.db,
    extra: {
        statement_timeout: 30000 * 10,
        ...config.db.extra,
    },
    synchronize: process.env.NODE_ENV === "test",
    dropSchema: process.env.NODE_ENV === "test",
    cache: !config.db.disableCache ? {
        type: "ioredis",
        options: {
            host: config.redis.host,
            port: config.redis.port,
            family: config.redis.family == null ? 0 : config.redis.family,
            password: config.redis.pass,
            keyPrefix: `${config.redis.prefix}:query:`,
            db: config.redis.db || 0,
        },
    } : false,
    logging: log,
    logger: log ? new MyCustomLogger() : undefined,
    maxQueryExecutionTime: 300,
    entities: entities,
    migrations: ["../../migration/*.js"],
});

export async function initDb(force = false) {
    if (force) {
        if (db.isInitialized) {
            await db.destroy();
        }
        await db.initialize();
        return;
    }

    if (db.isInitialized) {
        // nop
    } else {
        await db.initialize();
    }
}

export async function resetDb() {
    const reset = async () => {
        await redisClient.flushdb();
        const tables = await db.query(`SELECT relname AS "table"
		FROM pg_class C LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
		WHERE nspname NOT IN ('pg_catalog', 'information_schema')
			AND C.relkind = 'r'
			AND nspname !~ '^pg_toast';`);
        for (const table of tables) {
            await db.query(`DELETE FROM "${table.table}" CASCADE`);
        }
    };

    for (let i = 1; i <= 3; i++) {
        try {
            await reset();
        } catch (e) {
            if (i === 3) {
                throw e;
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
        }
        break;
    }
}
