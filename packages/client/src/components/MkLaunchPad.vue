<template>
<MkModal ref="modal" v-slot="{ type, maxHeight }" :prefer-type="preferedModalType" :anchor="anchor" :transparent-bg="true" :src="src" @click="close()" @closed="emit('closed')">
    <div class="szkkfdyq _popup _shadow" :class="{ asDrawer: type === 'drawer' }" :style="{ maxHeight: maxHeight ? maxHeight + 'px' : '' }">
        <div class="main">
            <template v-for="item in items">
                <button v-if="item && item.action" v-click-anime class="_button" @click="$event => { item.action($event); close(); }">
                    <i class="icon" :class="item.icon"></i>
                    <div class="text">{{ item.text }}</div>
                    <span v-if="item.indicate" class="indicator"><i class="_indicatorCircle"></i></span>
                </button>
                <MkA v-else-if="item" v-click-anime :to="item.to" @click.passive="close()">
                    <i class="icon" :class="item.icon"></i>
                    <div class="text">{{ item.text }}</div>
                    <span v-if="item.indicate" class="indicator"><i class="_indicatorCircle"></i></span>
                </MkA>
            </template>
        </div>
    </div>
</MkModal>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import MkModal from "@/components/MkModal.vue";
import { navbarItemDef } from "@/navbar";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { deviceKind } from "@/scripts/device-kind";
import { $i } from "@/account";

const props = withDefaults(defineProps<{
	src?: HTMLElement;
	anchor?: { x: string; y: string; };
    isMobileMode?: boolean;
}>(), {
    anchor: () => ({ x: "right", y: "center" }),
});

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const mobileItems = [
    { type: "link", text: i18n.ts.clips, icon: "ti ti-paperclip", to: "/my/clips", action: null, indicate: false },
    { type: "link", text: i18n.ts.announcements, icon: "ti ti-speakerphone", to: "/announcements", action: null, indicate: false },
    $i != null && ($i.isLocked || $i.hasPendingReceivedFollowRequest) ? {
        type: "link",
        text: i18n.ts.followRequests,
        icon: "ti ti-user-plus",
        indicated: computed(() => $i != null && $i.hasPendingReceivedFollowRequest),
        to: "/my/follow-requests",
        action: null,
    } : null,
    $i != null && ($i.isAdmin || $i.isModerator) ? {
        type: "link",
        text: i18n.ts.controlPanel,
        icon: "ti ti-dashboard",
        to: "/admin",
        action: null,
    } : null,
    { type: "link", text: i18n.ts.settings, icon: "ti ti-settings", to: "/settings", action: null, indicate: false },
];

const preferedModalType = (deviceKind === "desktop" && props.src != null) ? "popup" :
    deviceKind === "smartphone" ? "drawer" :
    "dialog";

const modal = ref<InstanceType<typeof MkModal>>();

const menu = defaultStore.state.menu;

const items = props.isMobileMode ? mobileItems : Object.keys(navbarItemDef).filter(k => !menu.includes(k)).map(k => navbarItemDef[k]).filter(def => def.show == null ? true : def.show).map(def => ({
    type: def.to ? "link" : "button",
    text: i18n.ts[def.title],
    icon: def.icon,
    to: def.to,
    action: def.action,
    indicate: def.indicated,
}));

function close() {
    modal.value?.close();
}
</script>

<style lang="scss" scoped>
.szkkfdyq {
	max-height: 100%;
	width: min(460px, 100vw);
	padding: 24px;
	box-sizing: border-box;
	overflow: auto;
	overscroll-behavior: contain;
	text-align: left;
	border-radius: 16px;

	&.asDrawer {
		width: 100%;
		padding: 16px 16px calc(env(safe-area-inset-bottom, 0px) + 16px) 16px;
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
		text-align: center;
	}

	> .main, > .sub {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));

		> * {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			vertical-align: bottom;
			height: 100px;
			border-radius: 10px;

			&:hover {
				color: var(--accent);
				background: var(--accentedBg);
				text-decoration: none;
			}

			> .icon {
				font-size: 24px;
				height: 24px;
			}

			> .text {
				margin-top: 12px;
				font-size: 0.8em;
				line-height: 1.5em;
			}

			> .indicator {
				position: absolute;
				top: 32px;
				left: 32px;
				color: var(--indicator);
				font-size: 8px;
				animation: blink 1s infinite;

				@media (max-width: 500px) {
					top: 16px;
					left: 16px;
				}
			}
		}
	}

	> .sub {
		margin-top: 8px;
		padding-top: 8px;
		border-top: solid 0.5px var(--divider);
	}
}
</style>
