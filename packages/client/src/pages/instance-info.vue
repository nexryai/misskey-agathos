<template>
<MkStickyContainer>
    <template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
    <MkSpacer v-if="instance" :content-max="600" :margin-min="16" :margin-max="32">
        <div v-if="tab === 'overview'" class="_formRoot">
            <div class="fnfelxur">
                <img :src="instance.iconUrl || instance.faviconUrl" alt="" class="icon"/>
                <span class="name">{{ instance.name || `(${i18n.ts.unknown})` }}</span>
            </div>
            <MkKeyValue :copy="host" oneline style="margin: 1em 0;">
                <template #key>Host</template>
                <template #value><span class="_monospace"><MkLink :url="`https://${host}`">{{ host }}</MkLink></span></template>
            </MkKeyValue>
            <MkKeyValue oneline style="margin: 1em 0;">
                <template #key>{{ i18n.ts.software }}</template>
                <template #value><span class="_monospace">{{ instance.softwareName || `(${i18n.ts.unknown})` }} / {{ instance.softwareVersion || `(${i18n.ts.unknown})` }}</span></template>
            </MkKeyValue>
            <MkKeyValue oneline style="margin: 1em 0;">
                <template #key>{{ i18n.ts.administrator }}</template>
                <template #value>{{ instance.maintainerName || `(${i18n.ts.unknown})` }} ({{ instance.maintainerEmail || `(${i18n.ts.unknown})` }})</template>
            </MkKeyValue>
            <MkKeyValue>
                <template #key>{{ i18n.ts.description }}</template>
                <template #value>{{ instance.description }}</template>
            </MkKeyValue>

            <FormSection v-if="iAmModerator && enableSudo">
                <template #label>Moderation</template>
                <FormSwitch v-model="suspended" class="_formBlock" @update:model-value="toggleSuspend">{{ i18n.ts.stopActivityDelivery }}</FormSwitch>
                <FormSwitch v-model="isBlocked" :disabled="!iAmAdmin || (isBlocked && !isExactlyBlocked)" class="_formBlock" @update:model-value="toggleBlock">{{ i18n.ts.blockThisInstance }}</FormSwitch>
                <MkButton class="mod-button" @click="refreshMetadata"><i class="ti ti-refresh"></i> Refresh metadata</MkButton>
                <MkButton v-if="(!suspended && !isBlocked) && $i && $i.isAdmin" inline danger class="mod-button" @click="deleteFollowing"><i class="ti ti-minus"></i> Unfollow All Instance Users</MkButton>
                <MkButton v-if="(suspended || isBlocked) && $i && $i.isAdmin" inline danger class="mod-button" @click="deleteInstanceUsers"><i class="ti ti-trash"></i> Delete All Instance Users</MkButton>
            </FormSection>

            <FormSection>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>{{ i18n.ts.registeredAt }}</template>
                    <template #value><MkTime mode="detail" :time="instance.caughtAt"/></template>
                </MkKeyValue>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>{{ i18n.ts.updatedAt }}</template>
                    <template #value><MkTime mode="detail" :time="instance.infoUpdatedAt"/></template>
                </MkKeyValue>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>{{ i18n.ts.latestRequestSentAt }}</template>
                    <template #value><MkTime v-if="instance.latestRequestSentAt" :time="instance.latestRequestSentAt"/><span v-else>N/A</span></template>
                </MkKeyValue>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>{{ i18n.ts.latestStatus }}</template>
                    <template #value>{{ instance.latestStatus ? instance.latestStatus : 'N/A' }}</template>
                </MkKeyValue>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>{{ i18n.ts.latestRequestReceivedAt }}</template>
                    <template #value><MkTime v-if="instance.latestRequestReceivedAt" :time="instance.latestRequestReceivedAt"/><span v-else>N/A</span></template>
                </MkKeyValue>
            </FormSection>

            <FormSection>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>Following (Pub)</template>
                    <template #value>{{ number(instance.followingCount) }}</template>
                </MkKeyValue>
                <MkKeyValue oneline style="margin: 1em 0;">
                    <template #key>Followers (Sub)</template>
                    <template #value>{{ number(instance.followersCount) }}</template>
                </MkKeyValue>
            </FormSection>

            <FormSection>
                <template #label>Well-known resources</template>
                <FormLink :to="`https://${host}/.well-known/host-meta`" external style="margin-bottom: 8px;">host-meta</FormLink>
                <FormLink :to="`https://${host}/.well-known/host-meta.json`" external style="margin-bottom: 8px;">host-meta.json</FormLink>
                <FormLink :to="`https://${host}/.well-known/nodeinfo`" external style="margin-bottom: 8px;">nodeinfo</FormLink>
                <FormLink :to="`https://${host}/robots.txt`" external style="margin-bottom: 8px;">robots.txt</FormLink>
                <FormLink :to="`https://${host}/manifest.json`" external style="margin-bottom: 8px;">manifest.json</FormLink>
            </FormSection>
        </div>
        <div v-else-if="tab === 'users'" class="_formRoot">
            <MkPagination v-slot="{items}" :pagination="usersPagination" style="display: grid; grid-template-columns: repeat(auto-fill,minmax(270px,1fr)); grid-gap: 12px;">
                <MkA v-for="user in items" :key="user.id" v-tooltip.mfm="`Last posted: ${new Date(user.updatedAt).toLocaleString()}`" class="user" :to="`/user-info/${user.id}`">
                    <MkUserCardMini :user="user"/>
                </MkA>
            </MkPagination>
        </div>
        <div v-else-if="tab === 'raw'" class="_formRoot">
            <MkObjectView tall :value="instance">
            </MkObjectView>
        </div>
    </MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import * as misskey from "misskey-js";
import MkObjectView from "@/components/MkObjectView.vue";
import FormLink from "@/components/form/link.vue";
import MkLink from "@/components/MkLink.vue";
import MkButton from "@/components/MkButton.vue";
import FormSection from "@/components/form/section.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import FormSwitch from "@/components/form/switch.vue";
import * as os from "@/os";
import number from "@/filters/number";
import { iAmModerator, iAmAdmin } from "@/account";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import MkUserCardMini from "@/components/MkUserCardMini.vue";
import MkPagination from "@/components/MkPagination.vue";
import { defaultStore } from "@/store";

const props = defineProps<{
	host: string;
}>();

let tab = ref("overview");
let meta = ref<misskey.entities.DetailedInstanceMetadata | null>(null);
let instance = ref<misskey.entities.Instance | null>(null);
let suspended = ref(false);
let isBlocked = ref(false);
let isExactlyBlocked = ref(false);
const enableSudo = defaultStore.state.enableSudo;

const usersPagination = {
    endpoint: iAmModerator ? "admin/show-users" : "users" as const,
    limit: 10,
    params: {
        sort: "+updatedAt",
        state: "all",
        hostname: props.host,
    },
    offsetMode: true,
};

async function fetch(): Promise<void> {
    if (iAmAdmin) {
        meta.value = await os.api("admin/meta");
    }
    instance.value = await os.api("federation/show-instance", {
        host: props.host,
    });
    suspended.value = instance.value.isSuspended;
    isBlocked.value = instance.value.isBlocked;
    isExactlyBlocked.value = meta.value ? meta.value.blockedHosts.includes(instance.value.host) : false;
}

async function toggleBlock(): Promise<void> {
    if (!meta.value) {
        fetch();
        throw new Error("No meta?");
    }
    if (!instance.value) {
        fetch();
        throw new Error("No instance?");
    }
    if (!isBlocked.value && !isExactlyBlocked.value) {
        isBlocked.value = true;
        return;
    }
    const { host } = instance.value;
    await os.api("admin/update-meta", {
        blockedHosts: isBlocked.value ? meta.value.blockedHosts.concat([host]) : meta.value.blockedHosts.filter(x => x !== host),
    });
    fetch();
}

async function toggleSuspend(): Promise<void> {
    if (!instance.value) {
        fetch();
        throw new Error("No instance?");
    }
    await os.api("admin/federation/update-instance", {
        host: instance.value.host,
        isSuspended: suspended,
    });
    fetch();
}

function refreshMetadata(): void {
    os.api("admin/federation/refresh-remote-instance-metadata", {
        host: instance.value!.host,
    });
    os.alert({
        text: "Refresh requested",
    });
}

async function deleteInstanceUsers(): Promise<void> {
    const { canceled } = await os.confirm({
        type: "warning",
        text: i18n.t("removeAreYouSure", { x: instance.value!.host }),
    });
    if (canceled) return;
    const typed = await os.inputText({
        text: i18n.t("typeToConfirm", { x: instance.value!.host }),
    });
    if (typed.canceled) return;
    if (typed.result === instance.value?.host) {
        await os.api("admin/delete-instance-users", {
            host: instance.value.host,
        });
        await os.alert({
            text: "Account Deletion is in progress",
        });
    } else {
        os.alert({
            type: "error",
            text: "input not match",
        });
    }
}

async function deleteFollowing(): Promise<void> {
    const { canceled } = await os.confirm({
        type: "warning",
        text: i18n.t("unfollowConfirm", { name: instance.value!.host }),
    });
    if (canceled) return;
    const typed = await os.inputText({
        text: i18n.t("typeToConfirm", { x: instance.value!.host }),
    });
    if (typed.canceled) return;
    if (typed.result === instance.value?.host) {
        await os.api("admin/federation/remove-all-following", {
            host: instance.value.host,
        });
        await os.alert({
            text: "Unfollowing is in progress",
        });
    } else {
        os.alert({
            type: "error",
            text: "input not match",
        });
    }
}

fetch();

const headerActions = computed(() => [{
    text: `https://${props.host}`,
    icon: "ti ti-external-link",
    handler: () => {
        window.open(`https://${props.host}`, "_blank");
    },
}]);

const headerTabs = computed(() => [{
    key: "overview",
    title: i18n.ts.overview,
    icon: "ti ti-info-circle",
}, {
    key: "chart",
    title: i18n.ts.charts,
    icon: "ti ti-chart-line",
}, {
    key: "users",
    title: i18n.ts.users,
    icon: "ti ti-users",
}, {
    key: "raw",
    title: "Raw",
    icon: "ti ti-code",
}]);

definePageMetadata({
    title: props.host,
    icon: "ti ti-server",
});
</script>

<style lang="scss" scoped>
.mod-button {
	margin-right: 8px;
	margin-bottom: 8px;
}

.fnfelxur {
	display: flex;
	align-items: center;

	> .icon {
		display: block;
		margin: 0 16px 0 0;
		height: 64px;
		border-radius: 8px;
	}

	> .name {
		word-break: break-all;
	}
}

.cmhjzshl {
	> .selects {
		display: flex;
		margin: 0 0 16px 0;
	}

	> .charts {
		> .label {
			margin-bottom: 12px;
			font-weight: bold;
		}
	}
}
</style>
