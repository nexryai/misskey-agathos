<template>
<MkStickyContainer>
    <template #header><MkPageHeader v-model:tab="src" :actions="headerActions" :tabs="headerTabs" :display-my-avatar="true"/></template>
    <MkSpacer :content-max="800">
        <div ref="rootEl" v-hotkey.global="keymap" class="cmuxhskf">
            <XPostForm v-if="$store.reactiveState.showFixedPostForm.value" class="post-form _block" fixed/>

            <div v-if="queue > 0" class="new"><button class="_buttonPrimary" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
            <div>
                <div v-if="((src === 'local' || src === 'social') && !isLocalTimelineAvailable) || (src === 'media' && !isMediaTimelineAvailable) || (src === 'personal' && !isPersonalTimelineAvailable) || (src === 'limited' && !isLimitedTimelineAvailable) || (src === 'global' && !isGlobalTimelineAvailable)" class="iwaalbte">
                    <p>
                        <i class="fas fa-minus-circle"></i>
                        {{ i18n.ts.disabledTimelineTitle }}
                    </p>
                    <p class="desc">{{ i18n.ts.disabledTimelineDescription }}</p>
                </div>
                <div v-else class="tl _block">
                    <XTimeline
                        ref="tl" :key="src"
                        class="tl"
                        :src="src"
                        :sound="true"
                        @queue="queueUpdated"
                    />
                </div>
            </div>
        </div>
    </MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, provide, ref } from "vue";
import XTimeline from "@/components/MkTimeline.vue";
import XPostForm from "@/components/MkPostForm.vue";
import { scroll } from "@/scripts/scroll";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import { $i } from "@/account";
import { definePageMetadata } from "@/scripts/page-metadata";

provide("shouldOmitHeaderTitle", true);

const isMediaTimelineAvailable = (!instance.disableLocalTimeline || ($i != null && ($i.isModerator || $i.isAdmin))) && defaultStore.state.enableMTL && defaultStore.state.enableLTL;
const isLocalTimelineAvailable = (!instance.disableLocalTimeline || ($i != null && ($i.isModerator || $i.isAdmin))) && defaultStore.state.enableLTL;
const isGlobalTimelineAvailable = (!instance.disableGlobalTimeline || ($i != null && ($i.isModerator || $i.isAdmin))) && defaultStore.state.enableGTL;
const isPersonalTimelineAvailable = $i != null && defaultStore.state.enablePTL;
const isLimitedTimelineAvailable = $i != null && defaultStore.state.enableLimitedTL;
const keymap = {
    "t": focus,
};

const tlComponent = ref<InstanceType<typeof XTimeline>>();
const rootEl = ref<HTMLElement>();

let queue = ref(0);
const src = computed({ get: () => defaultStore.reactiveState.tl.value.src, set: (x) => saveSrc(x) });

watch ($$(src), () => queue = 0);

function queueUpdated(q: number): void {
    queue = q;
}

function top(): void {
    scroll(rootEl, { top: 0 });
}

async function chooseList(ev: MouseEvent): Promise<void> {
    const lists = await os.api("users/lists/list");
    let items = lists.map(list => ({
        type: "link" as const,
        text: list.name,
        to: `/timeline/list/${list.id}`,
    }));
    items.push({
  	type: "link" as const,
  	icon: "ti ti-settings",
  	text: i18n.ts.manageLists,
  	indicate: false,
  	to: "/my/lists",
    });
    os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
    const antennas = await os.api("antennas/list");
    let items = antennas.map(antenna => ({
        type: "link" as const,
        text: antenna.name,
        indicate: antenna.hasUnreadNote,
        to: `/timeline/antenna/${antenna.id}`,
    }));
    items.push({
  	type: "link" as const,
  	icon: "ti ti-settings",
  	text: i18n.ts.manageAntennas,
  	indicate: false,
  	to: "/my/antennas",
    });
    os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: "home" | "local" | "social" | "global" | "limited" | "media" | "personal"): void {
    defaultStore.set("tl", {
        ...defaultStore.state.tl,
        src: newSrc,
    });
}

function focus(): void {
    tlComponent.focus();
}

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
    key: "home",
    title: i18n.ts._timelines.home,
    icon: "ti ti-home",
    iconOnly: true,
}, ...(isLocalTimelineAvailable ? [{
    key: "social",
    title: i18n.ts._timelines.social,
    icon: "ti ti-rocket",
    iconOnly: true,
}] : []), ...(isGlobalTimelineAvailable ? [{
    key: "global",
    title: i18n.ts._timelines.global,
    icon: "ti ti-whirl",
    iconOnly: true,
}] : []), {
    icon: "ti ti-list",
    title: i18n.ts.lists,
    iconOnly: true,
    onClick: chooseList,
}, {
    icon: "ti ti-antenna",
    title: i18n.ts.antennas,
    iconOnly: true,
    onClick: chooseAntenna,
}]);

definePageMetadata(computed(() => ({
    title: i18n.ts.timeline,
    icon: src === "local" ? "ti ti-planet" : src === "social" ? "ti ti-rocket" : src === "global" ? "ti ti-whirl" : src === "limited" ? "ti ti-lock-open" : src === "media" ? "ti ti-file" : src === "personal" ? "ti ti-book" : "ti ti-home",
})));
</script>

<style lang="scss" scoped>
.cmuxhskf {
	> .new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .post-form {
		border-radius: var(--radius);
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}
}
.iwaalbte {
	text-align: center;
	> p {
		margin: 16px;
		&.desc {
			font-size: 14px;
		}
	}
}
</style>
