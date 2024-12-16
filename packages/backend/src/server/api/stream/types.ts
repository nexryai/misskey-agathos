import { EventEmitter } from "events";
import Emitter from "strict-event-emitter-types";
import { User } from "@/models/entities/user.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { Note } from "@/models/entities/note.js";
import { Antenna } from "@/models/entities/antenna.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import { DriveFolder } from "@/models/entities/drive-folder.js";
import { UserList } from "@/models/entities/user-list.js";
import { Signin } from "@/models/entities/signin.js";
import { Packed } from "@/misc/schema.js";
import { Webhook } from "@/models/entities/webhook";

//#region Stream type-body definitions
export interface InternalStreamTypes {
	userChangeSuspendedState: { id: User["id"]; isSuspended: User["isSuspended"]; };
	userChangeSilencedState: { id: User["id"]; isSilenced: User["isSilenced"]; };
	userChangeModeratorState: { id: User["id"]; isModerator: User["isModerator"]; };
	userTokenRegenerated: { id: User["id"]; oldToken: User["token"]; newToken: User["token"]; };
	remoteUserUpdated: { id: User["id"]; };
	webhookCreated: Webhook;
	webhookDeleted: Webhook;
	webhookUpdated: Webhook;
	antennaCreated: Antenna;
	antennaDeleted: Antenna;
	antennaUpdated: Antenna;
}

export interface BroadcastTypes {
	emojiAdded: {
		emoji: Packed<"Emoji">;
	};
}

export interface UserStreamTypes {
	terminate: Record<string, unknown>;
	updateUserProfile: UserProfile;
	mute: User;
	unmute: User;
	block: User;
	unblock: User;
	follow: Packed<"UserDetailedNotMe">;
	unfollow: Packed<"User">;
	userAdded: Packed<"User">;
}

export interface MainStreamTypes {
	notification: Packed<"Notification">;
	mention: Packed<"Note">;
	reply: Packed<"Note">;
	renote: Packed<"Note">;
	follow: Packed<"UserDetailedNotMe">;
	followed: Packed<"User">;
	unfollow: Packed<"User">;
	meUpdated: Packed<"User">;
	urlUploadFinished: {
		marker?: string | null;
		file: Packed<"DriveFile">;
	};
	readAllNotifications: undefined;
	unreadNotification: Packed<"Notification">;
	unreadMention: Note["id"];
	readAllUnreadMentions: undefined;
	unreadSpecifiedNote: Note["id"];
	readAllUnreadSpecifiedNotes: undefined;
	readAllMessagingMessages: undefined;
	readAllAntennas: undefined;
	unreadAntenna: Antenna;
	readAllAnnouncements: undefined;
	readAllChannels: undefined;
	unreadChannel: Note["id"];
	myTokenRegenerated: undefined;
	signin: Signin;
	registryUpdated: {
		scope?: string[];
		key: string;
		value: any | null;
	};
	driveFileCreated: Packed<"DriveFile">;
	readAntenna: Antenna;
	receiveFollowRequest: Packed<"User">;
}

export interface DriveStreamTypes {
	fileCreated: Packed<"DriveFile">;
	fileDeleted: DriveFile["id"];
	fileUpdated: Packed<"DriveFile">;
	folderCreated: Packed<"DriveFolder">;
	folderDeleted: DriveFolder["id"];
	folderUpdated: Packed<"DriveFolder">;
}

export interface NoteStreamTypes {
	pollVoted: {
		choice: number;
		userId: User["id"];
	};
	deleted: {
		deletedAt: Date;
	};
	reacted: {
		reaction: string;
		emoji?: {
			name: string;
			url: string;
		} | null;
		userId: User["id"];
	};
	unreacted: {
		reaction: string;
		userId: User["id"];
	};
}
type NoteStreamEventTypes = {
	[key in keyof NoteStreamTypes]: {
		id: Note["id"];
		body: NoteStreamTypes[key];
	};
};

export interface ChannelStreamTypes {
	typing: User["id"];
}

export interface UserListStreamTypes {
	userAdded: Packed<"User">;
	userRemoved: Packed<"User">;
}

export interface AntennaStreamTypes {
	note: Note;
}
//#endregion

// 辞書(interface or type)から{ type, body }ユニオンを定義
// https://stackoverflow.com/questions/49311989/can-i-infer-the-type-of-a-value-using-extends-keyof-type
// VS Codeの展開を防止するためにEvents型を定義
type Events<T extends object> = { [K in keyof T]: { type: K; body: T[K]; } };
type EventUnionFromDictionary<
	T extends object,
	U = Events<T>
> = U[keyof U];

// name/messages(spec) pairs dictionary
export type StreamMessages = {
	internal: {
		name: "internal";
		payload: EventUnionFromDictionary<InternalStreamTypes>;
	};
	broadcast: {
		name: "broadcast";
		payload: EventUnionFromDictionary<BroadcastTypes>;
	};
	user: {
		name: `user:${User["id"]}`;
		payload: EventUnionFromDictionary<UserStreamTypes>;
	};
	main: {
		name: `mainStream:${User["id"]}`;
		payload: EventUnionFromDictionary<MainStreamTypes>;
	};
	drive: {
		name: `driveStream:${User["id"]}`;
		payload: EventUnionFromDictionary<DriveStreamTypes>;
	};
	note: {
		name: `noteStream:${Note["id"]}`;
		payload: EventUnionFromDictionary<NoteStreamEventTypes>;
	};
	userList: {
		name: `userListStream:${UserList["id"]}`;
		payload: EventUnionFromDictionary<UserListStreamTypes>;
	};
	antenna: {
		name: `antennaStream:${Antenna["id"]}`;
		payload: EventUnionFromDictionary<AntennaStreamTypes>;
	};
	notes: {
		name: "notesStream";
		payload: Packed<"Note">;
	};
};

// API event definitions
// ストリームごとのEmitterの辞書を用意
type EventEmitterDictionary = { [x in keyof StreamMessages]: Emitter<EventEmitter, { [y in StreamMessages[x]["name"]]: (e: StreamMessages[x]["payload"]) => void }> };
// 共用体型を交差型にする型 https://stackoverflow.com/questions/54938141/typescript-convert-union-to-intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
// Emitter辞書から共用体型を作り、UnionToIntersectionで交差型にする
export type StreamEventEmitter = UnionToIntersection<EventEmitterDictionary[keyof StreamMessages]>;
// { [y in name]: (e: spec) => void }をまとめてその交差型をEmitterにかけるとts(2590)にひっかかる

// provide stream channels union
export type StreamChannels = StreamMessages[keyof StreamMessages]["name"];
