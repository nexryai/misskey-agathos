<template>
<component
    :is="popup.component"
    v-for="popup in popups"
    :key="popup.id"
    v-bind="popup.props"
    v-on="popup.events"
/>

<XUpload v-if="uploads.length > 0"/>
<XStreamIndicator/>
<div v-if="pendingApiRequestsCount > 0" id="wait"></div>
<div v-if="dev && !streamModeEnabled" id="devTicker"><span>DEV BUILD -- DO NOT USE IN PRODUCTION</span></div> <div v-if="dev" id="versionInfo"><span>Nexkey build v{{ version }}-devel</span></div>
<div v-if="streamModeEnabled" id="devTicker"><span>Streaming mode is enabled</span></div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from "vue";
import { version } from "@/config";
import { popup, popups, pendingApiRequestsCount } from "@/os";
import { uploads } from "@/scripts/upload";
import * as sound from "@/scripts/sound";
import { $i } from "@/account";
import { stream } from "@/stream";
import { defaultStore } from "@/store";

const XStreamIndicator = defineAsyncComponent(() => import("./stream-indicator.vue"));
const XUpload = defineAsyncComponent(() => import("./upload.vue"));

const dev = _DEV_;
const streamModeEnabled = defaultStore.state.streamModeEnabled;

const onNotification = notification => {
    if (!$i || $i.mutingNotificationTypes.includes(notification.type)) return;

    if (document.visibilityState === "visible") {
        stream.send("readNotification", {
            id: notification.id,
        });

        popup(defineAsyncComponent(() => import("@/components/MkNotificationToast.vue")), {
            notification,
        }, {}, "closed");
    }

    sound.play("notification");
};

if ($i) {
    const connection = stream.useChannel("main", null, "UI");
    connection.on("notification", onNotification);
}
</script>

<style lang="scss">
@keyframes dev-ticker-blink {
	0% { opacity: 1; }
	50% { opacity: 0; }
	100% { opacity: 1; }
}

@keyframes progress-spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

#wait {
	display: block;
	position: fixed;
	z-index: 4000000;
	top: 15px;
	right: 15px;

	&:before {
		content: "";
		display: block;
		width: 18px;
		height: 18px;
		box-sizing: border-box;
		border: solid 2px transparent;
		border-top-color: var(--accent);
		border-left-color: var(--accent);
		border-radius: 50%;
		animation: progress-spinner 400ms linear infinite;
	}
}

#devTicker {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 2147483647;
	color: #ff0;
	background: rgba(0, 0, 0, 0.5);
	padding: 4px 5px;
	font-size: 14px;
	pointer-events: none;
	user-select: none;

	> span {
		animation: dev-ticker-blink 2s infinite;
	}
}

#versionInfo {
	position: fixed;
	top: 0;
	right: 0;
	z-index: 2147483647;
	color: #005dff;
	background: rgba(0, 0, 0, 0.2);
	padding: 4px 7px;
	font-size: 14px;
	pointer-events: none;
	user-select: none;
}

#botWarn {
	position: fixed;
	top: 0;
	right: 0;
	z-index: 2147483647;
	color: #ff00ff;
	background: rgba(0, 0, 0, 0.2);
	padding: 4px 7px;
	font-size: 14px;
	pointer-events: none;
	user-select: none;
	> span {
		animation: dev-ticker-blink 2s infinite;
	}
}

#adminWarn {
	position: fixed;
	bottom: 0;
	left: 0;
	z-index: 2147483647;
	color: #ffa500;
	background: rgba(0, 0, 0, 0.2);
	padding: 4px 7px;
	font-size: 14px;
	pointer-events: none;
	user-select: none;
	> span {
		animation: dev-ticker-blink 2s infinite;
	}
}
</style>
