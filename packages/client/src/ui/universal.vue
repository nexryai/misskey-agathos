<template>
<div class="dkgtipfy" :class="{ wallpaper }">
    <XSidebar v-if="!isMobile" class="sidebar"/>

    <MkStickyContainer class="contents">
        <template #header></template>
        <main style="min-width: 0;" :style="{ background: pageMetadata?.value?.bg }" @contextmenu.stop="onContextmenu">
            <div :class="$style.content">
                <RouterView/>
            </div>
            <div :class="$style.spacer"></div>
        </main>
    </MkStickyContainer>

    <button v-if="!isMobile" class="widgetButton _button" @click="widgetsShowing = true"><i class="ti ti-apps"></i></button>
    <button v-if="isMobile" class="postButton _button" @click="os.post()"><i class="ti ti-pencil"></i></button>

    <div v-if="isMobile" class="buttons" :style="{ background: bg }">
        <button class="button home _button" @click="mainRouter.currentRoute.value.name === 'index' ? top() : mainRouter.push('/')">
            <i class="icon ti ti-home"></i>
        </button>
        <button class="button notifications _button" @click="mainRouter.push('/my/notifications')">
            <i class="icon ti ti-bell"></i>
            <span v-if="$i?.hasUnreadNotification" class="indicator">
                <i class="_indicatorCircle"></i>
            </span>
        </button>
        <button class="button home _button" @click="mainRouter.currentRoute.value.name === 'explore' ? top() : mainRouter.push('/explore')">
            <i class="icon ti ti-hash"></i>
        </button>
        <button class="button widget _button" @click="widgetsShowing = true">
            <i class="icon ti ti-apps"></i>
        </button>
        <button class="button nav _button" @click="more();">
            <i class="icon ti ti-menu-2"></i>
            <span v-if="menuIndicated" class="indicator">
                <i class="_indicatorCircle"></i>
            </span>
        </button>
    </div>

    <transition :name="$store.state.animation ? 'widgetsDrawer-back' : ''">
        <div
            v-if="widgetsShowing"
            class="widgetsDrawer-back _modalBg"
            @click="widgetsShowing = false"
            @touchstart.passive="widgetsShowing = false"
        ></div>
    </transition>

    <transition :name="$store.state.animation ? 'widgetsDrawer' : ''">
        <XWidgets v-if="widgetsShowing" class="widgetsDrawer"/>
    </transition>

    <XCommon/>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, provide, onMounted, computed, ref, ComputedRef } from "vue";
import tinycolor from "tinycolor2";
import XCommon from "./_common_/common.vue";
import { instanceName } from "@/config";
import XSidebar from "@/ui/_common_/navbar.vue";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { navbarItemDef } from "@/navbar";
import { i18n } from "@/i18n";
import { $i } from "@/account";
import { mainRouter } from "@/router";
import { PageMetadata, provideMetadataReceiver } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
const XWidgets = defineAsyncComponent(() => import("./universal.widgets.vue"));

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;
const bg = ref<string | undefined>(undefined);

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isDesktop = ref(window.innerWidth >= DESKTOP_THRESHOLD);
const isMobile = ref(deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener("resize", () => {
    isMobile.value = deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD;
});

const pageMetadata = ref<null | ComputedRef<PageMetadata>>();
const widgetsShowing = ref(false);

provide("router", mainRouter);
provideMetadataReceiver((info) => {
    pageMetadata.value = info;
    if (pageMetadata.value.value) {
        document.title = `${pageMetadata.value.value.title} | ${instanceName}`;
    }
});

const menuIndicated = computed(() => {
    for (const def in navbarItemDef) {
        if (def === "notifications") continue; // 通知は下にボタンとして表示されてるから
        if (navbarItemDef[def].indicated) return true;
    }
    return false;
});

const enableBlur = ref(defaultStore.state.useBlurEffect);

const calcBg = () => {
    const rawBg = "var(--header)";
    const tinyBg = tinycolor(rawBg.startsWith("var(") ? getComputedStyle(document.documentElement).getPropertyValue(rawBg.slice(4, -1)) : rawBg);
    if (!enableBlur.value) {
        tinyBg.setAlpha(99);
    }
    bg.value = tinyBg.toRgbString();
};


document.documentElement.style.overflowY = "scroll";

if (defaultStore.state.widgets.length === 0) {
    defaultStore.set("widgets", [{
        name: "calendar",
        id: "a", place: "right", data: {},
    }, {
        name: "notifications",
        id: "b", place: "right", data: {},
    }, {
        name: "trends",
        id: "c", place: "right", data: {},
    }]);
}

onMounted(() => {
    calcBg();
    if (!isDesktop.value) {
        window.addEventListener("resize", () => {
            if (window.innerWidth >= DESKTOP_THRESHOLD) isDesktop.value = true;
        }, { passive: true });
    }
});

const onContextmenu = (ev) => {
    const isLink = (el: HTMLElement) => {
        if (el.tagName === "A") return true;
        if (el.parentElement) {
            return isLink(el.parentElement);
        }
    };
    if (isLink(ev.target)) return;
    if (["INPUT", "TEXTAREA", "IMG", "VIDEO", "CANVAS"].includes(ev.target.tagName) || ev.target.attributes["contenteditable"]) return;
    if (window.getSelection()?.toString() !== "") return;
    const path = mainRouter.getCurrentPath();
    os.contextMenu([{
        type: "label",
        text: path,
    }, {
        icon: "ti ti-window-maximize",
        text: i18n.ts.openInWindow,
        action: () => {
            os.pageWindow(path);
        },
    }], ev);
};

function top(): void {
    window.scroll({ top: 0, behavior: "smooth" });
}

function more(): void {
    os.popup(defineAsyncComponent(() => import("@/components/MkLaunchPad.vue")), {isMobileMode: true}, {
    }, "closed");
}

const wallpaper = localStorage.getItem("wallpaper") != null;
</script>

<style lang="scss" scoped>
.widgetsDrawer-enter-active,
.widgetsDrawer-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.widgetsDrawer-enter-from,
.widgetsDrawer-leave-active {
	opacity: 0;
	transform: translateX(240px);
}

.widgetsDrawer-back-enter-active,
.widgetsDrawer-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.widgetsDrawer-back-enter-from,
.widgetsDrawer-back-leave-active {
	opacity: 0;
}

.menuDrawer-enter-active,
.menuDrawer-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.menuDrawer-enter-from,
.menuDrawer-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.menuDrawer-back-enter-active,
.menuDrawer-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.menuDrawer-back-enter-from,
.menuDrawer-back-leave-active {
	opacity: 0;
}

.dkgtipfy {
	$ui-font-size: 1em; // TODO: どこかに集約したい
	$widgets-hide-threshold: 1090px;

	// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	min-height: calc(var(--vh, 1vh) * 100);
	box-sizing: border-box;
	display: flex;

	&.wallpaper {
		background: var(--wallpaperOverlay);
		//backdrop-filter: var(--blur, blur(4px));
	}

	> .contents {
		width: 100%;
		min-width: 0;
		background: var(--bg);
	}

	> .widgets {
		padding: 0 var(--margin);
		border-left: solid 0.5px var(--divider);
		background: var(--bg);

		@media (max-width: $widgets-hide-threshold) {
			display: none;
		}
	}

	> .widgetButton {
		display: block;
		position: fixed;
		z-index: 1000;
		bottom: 32px;
		right: 32px;
		width: 64px;
		height: 64px;
		border-radius: 100%;
		box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
		font-size: 22px;
		background: var(--panel);
	}

    > .postButton {
        display: block;
        position: fixed;
        z-index: 1000;
        bottom: 92px;
        right: 32px;
        width: 64px;
        height: 64px;
        border-radius: 100%;
        box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
        font-size: 22px;
        background: var(--panel);
    }

	> .widgetsDrawer-back {
		z-index: 1001;
	}

	> .widgetsDrawer {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 1001;
		// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
		height: calc(var(--vh, 1vh) * 100);
		padding: var(--margin);
		box-sizing: border-box;
		overflow: auto;
		overscroll-behavior: contain;
		/*background: var(--bg);*/
	}

	> .buttons {
		position: fixed;
		z-index: 1000;
		bottom: 0;
		left: 0;
		padding: 12px 12px max(12px, env(safe-area-inset-bottom, 0px)) 12px;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-gap: 8px;
		width: 100%;
        height: 52px;
		box-sizing: border-box;
		-webkit-backdrop-filter: var(--blur, blur(32px));
		backdrop-filter: var(--blur, blur(32px));
		background-color: var(--header);
		border-top: solid 0.5px var(--divider);

		> .button {
			position: relative;
			padding: 0;
			aspect-ratio: 1;
			width: 100%;
            height: 32px;
			max-width: 60px;
			margin: auto;
			border-radius: 10px;
			background: var(--panel);
			color: var(--fg);

			&:hover {
				background: var(--panelHighlight);
			}
			&:active {
				background: var(--X2);
			}

			> .indicator {
				position: absolute;
				top: 0;
				left: 0;
				color: var(--indicator);
				font-size: 16px;
				animation: blink 1s infinite;
			}

			> .icon {
				font-size: 18px;
				vertical-align: middle;
			}
		}
	}

	> .menuDrawer-back {
		z-index: 1001;
	}

	> .menuDrawer {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1001;
		// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
		height: calc(var(--vh, 1vh) * 100);
		width: 240px;
		box-sizing: border-box;
		contain: strict;
		overflow: auto;
		overscroll-behavior: contain;
		background: var(--navBg);
	}
}
</style>

<style lang="scss" module>
.statusbars {
	position: sticky;
	top: 0;
	left: 0;
}

.spacer {
	$widgets-hide-threshold: 1090px;

	height: calc(env(safe-area-inset-bottom, 0px) + 96px);

	@media (min-width: ($widgets-hide-threshold + 1px)) {
		display: none;
	}
}
</style>
