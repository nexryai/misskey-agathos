<template>
<div ref="el" class="hiyeyicy" :class="{ wide: !narrow }">
    <div v-if="!narrow || currentPage?.route.name == null" class="nav">
        <MkSpacer :content-max="700" :margin-min="16">
            <div class="lxpfedzu">
                <div class="banner">
                    <i class="icon ti ti-dashboard dashboard-icon"></i>
                </div>

                <MkInfo v-if="thereIsUnresolvedAbuseReport" warn class="info">{{ i18n.ts.thereIsUnresolvedAbuseReportWarning }} <MkA to="/admin/abuses" class="_link">{{ i18n.ts.check }}</MkA></MkInfo>
                <MkInfo v-if="noMaintainerInformation" warn class="info">{{ i18n.ts.noMaintainerInformationWarning }} <MkA to="/admin/settings" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>
                <MkInfo v-if="noBotProtection" warn class="info">{{ i18n.ts.noBotProtectionWarning }} <MkA to="/admin/security" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>

                <FormSwitch v-model="moderator" class="_formBlock" @update:model-value="toggleModerator">{{ i18n.ts.moderator }}</FormSwitch>
                <MkSuperMenu :def="menuDef" :grid="narrow"></MkSuperMenu>
            </div>
        </MkSpacer>
    </div>
    <div v-if="!(narrow && currentPage?.route.name == null)" class="main">
        <RouterView/>
    </div>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { i18n } from "@/i18n";
import MkSuperMenu from "@/components/MkSuperMenu.vue";
import MkInfo from "@/components/MkInfo.vue";
import { instance } from "@/instance";
import * as os from "@/os";
import { lookupUser } from "@/scripts/lookup-user";
import { useRouter } from "@/router";
import { definePageMetadata, provideMetadataReceiver } from "@/scripts/page-metadata";
import { defaultStore } from "@/store";
import FormSwitch from "@/components/form/switch.vue";
import { unisonReload } from "@/scripts/unison-reload";
import { iAmAdmin } from "@/account";

const isEmpty = (x: string | null) => x == null || x === "";

const router = useRouter();

const indexInfo = {
    title: i18n.ts.controlPanel,
    icon: "ti ti-settings",
    hideHeader: true,
};

provide("shouldOmitHeaderTitle", false);

let INFO = ref(indexInfo);
let childInfo = ref(null);
let narrow = ref(false);
let el = ref(null);
let noMaintainerInformation = isEmpty(instance.maintainerName) || isEmpty(instance.maintainerEmail);
let noBotProtection = !instance.disableRegistration && !instance.enableHcaptcha && !instance.enableRecaptcha　&& !instance.enableTurnstil;
let thereIsUnresolvedAbuseReport = ref(false);
let currentPage = computed(() => router.currentRef.value.child);
let moderator = ref(false);

moderator.value = defaultStore.state.enableSudo;

os.api("admin/abuse-user-reports", {
    state: "unresolved",
    limit: 1,
}).then(reports => {
    if (reports?.length > 0) thereIsUnresolvedAbuseReport.value = true;
});

const NARROW_THRESHOLD = 600;
const ro = new ResizeObserver((entries) => {
    if (entries.length === 0) return;
    narrow.value = entries[0].borderBoxSize[0].inlineSize < NARROW_THRESHOLD;
});

const menuDef = computed(() => [{
    title: i18n.ts.quickAction,
    items: [{
        type: "button",
        icon: "ti ti-search",
        text: i18n.ts.lookup,
        action: lookup,
    }, ...(instance.disableRegistration ? [{
        type: "button",
        icon: "ti ti-user",
        text: i18n.ts.invite,
        action: invite,
    }] : [])],
}, {
    title: i18n.ts.administration,
    items: [{
        icon: "ti ti-dashboard",
        text: i18n.ts.dashboard,
        to: "/admin/overview",
        active: currentPage.value?.route.name === "overview",
    }, {
        icon: "ti ti-users",
        text: i18n.ts.users,
        to: "/admin/users",
        active: currentPage.value?.route.name === "users",
    }, {
        icon: "ti ti-mood-happy",
        text: i18n.ts.customEmojis,
        to: "/admin/emojis",
        active: currentPage.value?.route.name === "emojis",
    }, {
        icon: "ti ti-whirl",
        text: i18n.ts.federation,
        to: "/about#federation",
        active: currentPage.value?.route.name === "federation",
    }, {
        icon: "ti ti-clock-play",
        text: i18n.ts.jobQueue,
        to: "/admin/queue",
        active: currentPage.value?.route.name === "queue",
    }, {
        icon: "ti ti-cloud",
        text: i18n.ts.files,
        to: "/admin/files",
        active: currentPage.value?.route.name === "files",
    }, {
        icon: "ti ti-speakerphone",
        text: i18n.ts.announcements,
        to: "/admin/announcements",
        active: currentPage.value?.route.name === "announcements",
    }, {
        icon: "ti ti-exclamation-circle",
        text: i18n.ts.abuseReports,
        to: "/admin/abuses",
        active: currentPage.value?.route.name === "abuses",
    }],
}, {
    title: i18n.ts.settings,
    items: [...(iAmAdmin ? [{
        icon: "ti ti-settings",
        text: i18n.ts.general,
        to: "/admin/settings",
        active: currentPage.value?.route.name === "settings",
    }, {
        icon: "ti ti-cloud",
        text: i18n.ts.objectStorage,
        to: "/admin/object-storage",
        active: currentPage.value?.route.name === "object-storage",
    }, {
        icon: "ti ti-shield",
        text: i18n.ts.security,
        to: "/admin/security",
        active: currentPage.value?.route.name === "security",
    }] : []), {
        icon: "ti ti-planet",
        text: i18n.ts.relays,
        to: "/admin/relays",
        active: currentPage.value?.route.name === "relays",
    }, ...(iAmAdmin ? [{
        icon: "ti ti-ban",
        text: i18n.ts.instanceBlocking,
        to: "/admin/instance-block",
        active: currentPage.value?.route.name === "instance-block",
    }, {
        icon: "ti ti-ghost",
        text: i18n.ts.proxyAccount,
        to: "/admin/proxy-account",
        active: currentPage.value?.route.name === "proxy-account",
    }] : [])],
}, {
    title: i18n.ts.info,
    items: [{
        icon: "ti ti-list-check",
        text: i18n.ts.moderationlogs,
        to: "/admin/moderation-logs",
        active: currentPage.value?.route.name === "moderation-logs",
    }, {
        icon: "ti ti-database",
        text: i18n.ts.database,
        to: "/admin/database",
        active: currentPage.value?.route.name === "database",
    }],
}]);

watch(narrow, () => {
    if (currentPage.value?.route.name == null && !narrow.value) {
        router.push("/admin/overview");
    }
});

onMounted(() => {
    if (el.value) {
        ro.observe(el.value);
    }

    narrow.value = el.value?.offsetWidth < NARROW_THRESHOLD;
    if (currentPage.value?.route.name == null && !narrow.value) {
        router.push("/admin/overview");
    }
});

onUnmounted(() => {
    ro.disconnect();
});

watch(router.currentRef, (to) => {
    if (to.route.path === "/admin" && to.child?.route.name == null && !narrow) {
        router.replace("/admin/overview");
    }
});

provideMetadataReceiver((info) => {
    if (info.value == null) {
        childInfo.value = null;
    } else {
        childInfo.value = info;
    }
});

async function toggleModerator(v) {
    const confirm = await os.confirm({
        type: "warning",
        text: v ? i18n.ts.sudoConfirm : i18n.ts.unsudoConfirm,
    });
    if (confirm.canceled) {
        moderator.value = !v;
    } else {
        if (v) {
            await defaultStore.set("enableSudo", true);
            await os.alert({
                text: i18n.ts.sudoActivated,
            });
            await unisonReload();
        } else {
            await defaultStore.set("enableSudo", false);
            await os.alert({
                text: i18n.ts.sudoDeactivated,
            });
            await unisonReload();
        }
    }
}

const invite = () => {
    os.api("admin/invite").then(x => {
        os.alert({
            type: "info",
            text: x?.code,
        });
    }).catch(err => {
        os.alert({
            type: "error",
            text: err,
        });
    });
};

const lookup = (ev) => {
    os.popupMenu([{
        text: i18n.ts.user,
        icon: "ti ti-user",
        action: () => {
            lookupUser();
        },
    }], ev.currentTarget ?? ev.target);
};

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(INFO);

defineExpose({
    header: {
        title: i18n.ts.controlPanel,
    },
});
</script>

<style lang="scss" scoped>
.dashboard-icon {
  text-align: center;
  font-size: 25px;
}

.hiyeyicy {
	&.wide {
		display: flex;
		margin: 0 auto;
		height: 100%;

		> .nav {
			width: 32%;
			max-width: 280px;
			box-sizing: border-box;
			border-right: solid 0.5px var(--divider);
			overflow: auto;
			height: 100%;
		}

		> .main {
			flex: 1;
			min-width: 0;
		}
	}

	> .nav {
		.lxpfedzu {
			> .info {
				margin: 16px 0;
			}

			> .banner {
				margin: 16px;

				> .icon {
					display: block;
					margin: auto;
					height: 42px;
					border-radius: 8px;
				}
			}
		}
	}
}
</style>
