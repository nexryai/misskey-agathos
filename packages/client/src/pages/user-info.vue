<template>
<MkStickyContainer>
    <template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
    <MkSpacer :content-max="600" :margin-min="16" :margin-max="32">
        <FormSuspense :p="init">
            <div v-if="tab === 'overview'" class="_formRoot">
                <div class="_formBlock aeakzknw">
                    <MkAvatar class="avatar" :user="user" :show-indicator="true"/>
                    <div class="body">
                        <span class="name"><MkUserName class="name" :user="user"/></span>
                        <span class="sub"><span class="acct _monospace">@{{ acct(user) }}</span></span>
                        <span class="state">
                            <span v-if="suspended" class="suspended">Suspended</span>
                            <span v-if="silenced" class="silenced">Silenced</span>
                            <span v-if="moderator" class="moderator">Moderator</span>
                        </span>
                    </div>
                </div>

                <MkInfo v-if="user.username.includes('.')" class="_formBlock">{{ i18n.ts.isSystemAccount }}</MkInfo>

                <div v-if="user.url" class="_formLinksGrid _formBlock">
                    <FormLink :to="userPage(user)">Profile</FormLink>
                    <FormLink :to="user.url" :external="true">Profile (remote)</FormLink>
                </div>
                <FormLink v-else class="_formBlock" :to="userPage(user)">Profile</FormLink>

                <FormLink v-if="user.host" class="_formBlock" :to="`/instance-info/${user.host}`">{{ i18n.ts.instanceInfo }}</FormLink>

                <div class="_formBlock">
                    <MkKeyValue :copy="user.id" oneline style="margin: 1em 0;">
                        <template #key>ID</template>
                        <template #value><span class="_monospace">{{ user.id }}</span></template>
                    </MkKeyValue>
                    <!-- 要る？
					<MkKeyValue :copy="ips[0].ip" v-if="ips.length > 0" oneline style="margin: 1em 0;">
						<template #key>IP (recent)</template>
						<template #value><span class="_monospace">{{ ips[0].ip }}</span></template>
					</MkKeyValue>
					-->
                    <MkKeyValue oneline style="margin: 1em 0;">
                        <template #key>{{ i18n.ts.createdAt }}</template>
                        <template #value><span class="_monospace"><MkTime :time="user.createdAt" :mode="'detail'"/></span></template>
                    </MkKeyValue>
                    <MkKeyValue v-if="info && $i.isAdmin && enableSudo" oneline style="margin: 1em 0;">
                        <template #key>{{ i18n.ts.lastActiveDate }}</template>
                        <template #value><span class="_monospace"><MkTime :time="info.lastActiveDate" :mode="'detail'"/></span></template>
                    </MkKeyValue>
                    <MkKeyValue v-if="info && $i.isAdmin && enableSudo" :copy="info.email" oneline style="margin: 1em 0;">
                        <template #key>{{ i18n.ts.email }}</template>
                        <template #value><span class="_monospace">{{ info.email }}</span></template>
                    </MkKeyValue>
                    <MkKeyValue v-if="info && enableSudo" oneline style="margin: 1em 0;">
                        <template #key>Email Status</template>
                        <template v-if="$i.isAdmin && info.email && info.emailVerified" #value><span class="_monospace">Verified</span></template>
                        <template v-if="$i.isAdmin && info.email && !info.emailVerified" #value><span class="_monospace">Not Verified</span></template>
                        <template v-if="$i.isAdmin && !info.email" #value><span class="_monospace">Not Registered</span></template>
                        <template v-if="!$i.isAdmin && info.emailVerified" #value><span class="_monospace">Verified</span></template>
                        <template v-if="!$i.isAdmin && !info.emailVerified" #value><span class="_monospace">Not Verified / Not Registered</span></template>
                    </MkKeyValue>
                </div>

                <FormSection>
                    <template #label>ActivityPub</template>

                    <div class="_formBlock">
                        <MkKeyValue v-if="user.host" oneline style="margin: 1em 0;">
                            <template #key>{{ i18n.ts.instanceInfo }}</template>
                            <template #value><MkA :to="`/instance-info/${user.host}`" class="_link">{{ user.host }} <i class="ti ti-chevron-right"></i></MkA></template>
                        </MkKeyValue>
                        <MkKeyValue v-else oneline style="margin: 1em 0;">
                            <template #key>{{ i18n.ts.instanceInfo }}</template>
                            <template #value>(Local user)</template>
                        </MkKeyValue>
                        <MkKeyValue oneline style="margin: 1em 0;">
                            <template #key>{{ i18n.ts.updatedAt }}</template>
                            <template #value><MkTime v-if="user.lastFetchedAt" mode="detail" :time="user.lastFetchedAt"/><span v-else>N/A</span></template>
                        </MkKeyValue>
                        <MkKeyValue v-if="ap" oneline style="margin: 1em 0;">
                            <template #key>Type</template>
                            <template #value><span class="_monospace">{{ ap.type }}</span></template>
                        </MkKeyValue>
                    </div>

                    <FormButton v-if="user.host != null && enableSudo" class="_formBlock" @click="updateRemoteUser"><i class="fas fa-sync"></i> {{ i18n.ts.updateRemoteUser }}</FormButton>

                    <FormFolder class="_formBlock">
                        <template #label>Raw</template>

                        <MkObjectView v-if="ap" tall :value="ap">
                        </MkObjectView>
                    </FormFolder>
                </FormSection>
            </div>
            <div v-else-if="tab === 'moderation'" class="_formRoot">
                <FormSwitch v-if="user.host == null && $i.isAdmin && (moderator || !user.isAdmin)" v-model="moderator" class="_formBlock" @update:model-value="toggleModerator">{{ i18n.ts.moderator }}</FormSwitch>
                <FormSwitch v-model="silenced" class="_formBlock" @update:model-value="toggleSilence">{{ i18n.ts.silence }}</FormSwitch>
                <FormSwitch v-model="suspended" class="_formBlock" @update:model-value="toggleSuspend">{{ i18n.ts.suspend }}</FormSwitch>
                {{ i18n.ts.reflectMayTakeTime }}
                <div class="_formBlock">
                    <FormButton v-if="user.host == null && iAmModerator" inline class="mod-button" @click="resetPassword"><i class="ti ti-key"></i> {{ i18n.ts.resetPassword }}</FormButton>
                    <FormButton v-if="$i.isAdmin" inline danger class="mod-button" @click="deleteAccount"><i class="ti ti-trash"></i> {{ i18n.ts.deleteAccount }}</FormButton>
                    <FormButton v-if="$i.isAdmin" inline danger class="mod-button" @click="deleteAllFiles"><i class="ti ti-trash"></i> {{ i18n.ts.deleteAllFiles }}</FormButton>
                    <FormButton v-if="user.host == null && iAmModerator && !suspended" inline class="mod-button" @click="sendModNotification"><i class="ti ti-alert-circle"></i> {{ $ts.sendModNotification }}</FormButton>
                </div>
                <FormTextarea v-model="moderationNote" manual-save class="_formBlock">
                    <template #label>Moderation note</template>
                </FormTextarea>
                <FormFolder class="_formBlock">
                    <template #label>IP</template>
                    <MkInfo v-if="!iAmAdmin" warn>{{ i18n.ts.requireAdminForView }}</MkInfo>
                    <MkInfo v-else>The date is the IP address was first acknowledged.</MkInfo>
                    <template v-if="iAmAdmin && ips">
                        <div v-for="record in ips" :key="record.ip" class="_monospace" :class="$style.ip" style="margin: 1em 0;">
                            <span class="date">{{ record.createdAt }}</span>
                            <span class="ip">{{ record.ip }}</span>
                        </div>
                    </template>
                </FormFolder>
                <FormFolder class="_formBlock">
                    <template #label>{{ i18n.ts.files }}</template>

                    <MkFileListForAdmin :pagination="filesPagination" view-mode="grid"/>
                </FormFolder>
                <FormSection v-if="user.host == null">
                    <template #label>Drive Capacity Override</template>

                    <FormInput v-if="user.host == null" v-model="driveCapacityOverrideMb" inline :manual-save="true" type="number" :placeholder="i18n.t('defaultValueIs', { value: instance.driveCapacityPerLocalUserMb })" @update:model-value="applyDriveCapacityOverride">
                        <template #label>{{ i18n.ts.driveCapOverrideLabel }}</template>
                        <template #suffix>MB</template>
                        <template #caption>
                            {{ i18n.ts.driveCapOverrideCaption }}
                        </template>
                    </FormInput>
                </FormSection>
                <FormSection v-if="iAmModerator">
                    <template #label>{{ i18n.ts.usageAmount }}</template>
                    <div class="_formBlock uawsfosz">
                        <div class="meter"><div :style="meterStyle"></div></div>
                    </div>
                    <FormSplit>
                        <MkKeyValue class="_formBlock">
                            <template #key>{{ i18n.ts.capacity }}</template>
                            <template #value>{{ bytes(capacity, 1) }}</template>
                        </MkKeyValue>
                        <MkKeyValue class="_formBlock">
                            <template #key>{{ i18n.ts.inUse }}</template>
                            <template #value>{{ bytes(usage, 1) }}</template>
                        </MkKeyValue>
                    </FormSplit>
                </FormSection>
            </div>
            <div v-else-if="tab === 'raw'" class="_formRoot">
                <MkObjectView v-if="info && $i.isAdmin" tall :value="info">
                </MkObjectView>

                <MkObjectView tall :value="user">
                </MkObjectView>
            </div>
        </FormSuspense>
    </MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from "vue";
import * as misskey from "misskey-js";
import tinycolor from "tinycolor2";
import MkObjectView from "@/components/MkObjectView.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import FormButton from "@/components/MkButton.vue";
import FormInput from "@/components/form/input.vue";
import FormSplit from "@/components/form/split.vue";
import FormFolder from "@/components/form/folder.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import FormSuspense from "@/components/form/suspense.vue";
import MkFileListForAdmin from "@/components/MkFileListForAdmin.vue";
import MkInfo from "@/components/MkInfo.vue";
import * as os from "@/os";
import bytes from "@/filters/bytes";
import { url } from "@/config";
import { userPage, acct } from "@/filters/user";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { iAmAdmin, iAmModerator } from "@/account";
import { instance } from "@/instance";
import { defaultStore } from "@/store";

const props = defineProps<{
	userId: string;
}>();

let tab = $ref("overview");
let user = $ref<null | misskey.entities.UserDetailed>();
let init = $ref<ReturnType<typeof createFetcher>>();
let info = $ref();
let ips = $ref(null);
let ap = $ref(null);
let moderator = $ref(false);
let silenced = $ref(false);
let suspended = $ref(false);
let driveCapacityOverrideMb: number | null = $ref(0);
let moderationNote = $ref("");
const filesPagination = {
    endpoint: "admin/drive/files" as const,
    limit: 10,
    params: computed(() => ({
        userId: props.userId,
    })),
};
const enableSudo = defaultStore.state.enableSudo;
const usage = ref<any>(null);
const capacity = ref<any>(null);

const meterStyle = computed(() => {
    return {
        width: `${usage.value / capacity.value * 100}%`,
        background: tinycolor({
            h: 180 - (usage.value / capacity.value * 180),
            s: 0.7,
            l: 0.5,
        }),
    };
});

function createFetcher() {
    if (iAmModerator) {
        return () => Promise.all([os.api("users/show", {
            userId: props.userId,
        }), os.api("admin/show-user", {
            userId: props.userId,
        }), iAmAdmin ? os.api("admin/get-user-ips", {
            userId: props.userId,
        }) : Promise.resolve(null)]).then(([_user, _info, _ips]) => {
            user = _user;
            info = _info;
            ips = _ips;
            moderator = info.isModerator;
            silenced = info.isSilenced;
            suspended = info.isSuspended;
            driveCapacityOverrideMb = user.driveCapacityOverrideMb;
            moderationNote = info.moderationNote;
            capacity.value = info.capacity;
            usage.value = info.usage;

            watch($$(moderationNote), async () => {
                await os.api("admin/update-user-note", { userId: user.id, text: moderationNote });
                await refreshUser();
            });
        });
    } else {
        return () => os.api("users/show", {
            userId: props.userId,
        }).then((res) => {
            user = res;
        });
    }
}

function refreshUser() {
    init = createFetcher();
}

async function updateRemoteUser() {
    await os.apiWithDialog("federation/update-remote-user", { userId: user.id });
    refreshUser();
}

async function resetPassword() {
    const confirm = await os.confirm({
        type: "warning",
        text: i18n.ts.resetPasswordConfirm,
    });
    if (confirm.canceled) {
        return;
    } else {
        const { password } = await os.api("admin/reset-password", {
            userId: user.id,
        });
        os.alert({
            type: "success",
            text: i18n.t("newPasswordIs", { password }),
        });
    }
}

async function reset2fa() {
    const confirm = await os.confirm({
        type: "warning",
        text: i18n.ts.reset2faConfirm,
    });
    if (confirm.canceled) {
        return;
    } else {
        await os.api("admin/reset-2fa", {
            userId: user.id,
        });
        os.alert({
            type: "success",
        });
    }
}

async function toggleSilence(v) {
    const confirm = await os.confirm({
        type: "warning",
        text: v ? i18n.ts.silenceConfirm : i18n.ts.unsilenceConfirm,
    });
    if (confirm.canceled) {
        silenced = !v;
    } else {
        await os.api(v ? "admin/silence-user" : "admin/unsilence-user", { userId: user.id });
        await refreshUser();
    }
}

async function toggleSuspend(v) {
    const confirm = await os.confirm({
        type: "warning",
        text: v ? i18n.ts.suspendConfirm : i18n.ts.unsuspendConfirm,
    });
    if (confirm.canceled) {
        suspended = !v;
    } else {
        await os.api(v ? "admin/suspend-user" : "admin/unsuspend-user", { userId: user.id });
        await refreshUser();
    }
}

async function toggleModerator(v) {
    await os.api(v ? "admin/moderators/add" : "admin/moderators/remove", { userId: user.id });
    await refreshUser();
}

async function deleteAllFiles() {
    const confirm = await os.confirm({
        type: "warning",
        text: i18n.ts.deleteAllFilesConfirm,
    });
    if (confirm.canceled) return;
    const typed = await os.inputText({
        text: i18n.t("typeToConfirm", { x: user?.username }),
    });
    if (typed.canceled) return;

    if (typed.result === user?.username) {
        const process = async () => {
            await os.api("admin/delete-all-files-of-a-user", { userId: user.id });
            os.success();
        };
        await process().catch(err => {
            os.alert({
                type: "error",
                text: err.toString(),
            });
        });
        await refreshUser();
    } else {
        os.alert({
            type: "error",
            text: "input not match",
        });
    }
}

async function applyDriveCapacityOverride() {
    let driveCapOrMb = driveCapacityOverrideMb;
    if (driveCapacityOverrideMb && driveCapacityOverrideMb < 0) {
        driveCapOrMb = null;
    }
    try {
        await os.apiWithDialog("admin/drive-capacity-override", { userId: user.id, overrideMb: driveCapOrMb });
        await refreshUser();
    } catch (err) {
        os.alert({
            type: "error",
            text: err.toString(),
        });
    }
}

async function deleteAccount() {
    const confirm = await os.confirm({
        type: "warning",
        text: i18n.ts.deleteAccountConfirm,
    });
    if (confirm.canceled) return;

    const typed = await os.inputText({
        text: i18n.t("typeToConfirm", { x: user?.username }),
    });
    if (typed.canceled) return;

    if (typed.result === user?.username) {
        await os.apiWithDialog("admin/delete-account", {
            userId: user.id,
        });
    } else {
        os.alert({
            type: "error",
            text: "input not match",
        });
    }
}

async function sendModNotification() {
    const { canceled, result: comment } = await os.inputText({
        title: "Moderation Notification 運営からの通知",
    });
    if (canceled) return;
    await os.api("admin/send-notification", {
        comment: comment,
        userId: user.id,
    });
    os.success();
}

watch(() => props.userId, () => {
    init = createFetcher();
}, {
    immediate: true,
});

watch($$(user), () => {
    os.api("ap/get", {
        uri: user.uri ?? `${url}/users/${user.id}`,
    }).then(res => {
        ap = res;
    });
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
    key: "overview",
    title: i18n.ts.overview,
    icon: "ti ti-info-circle",
}, (iAmModerator && enableSudo) ? {
    key: "moderation",
    title: i18n.ts.moderation,
    icon: "ti ti-user-exclamation",
} : null, {
    key: "raw",
    title: "Raw",
    icon: "ti ti-code",
}].filter(x => x != null));

definePageMetadata(computed(() => ({
    title: user ? acct(user) : i18n.ts.userInfo,
    icon: "ti ti-info-circle",
})));
</script>

<style lang="scss" scoped>
@use "sass:math";

.mod-button {
	margin-right: 8px;
	margin-bottom: 8px;
}

.aeakzknw {
	display: flex;
	align-items: center;

	> .avatar {
		display: block;
		width: 64px;
		height: 64px;
		margin-right: 16px;
	}

	> .body {
		flex: 1;
		overflow: hidden;

		> .name {
			display: block;
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		> .sub {
			display: block;
			width: 100%;
			font-size: 85%;
			opacity: 0.7;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		> .state {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
			margin-top: 4px;

			&:empty {
				display: none;
			}

			> .suspended, > .silenced, > .moderator {
				display: inline-block;
				border: solid 1px;
				border-radius: 6px;
				padding: 2px 6px;
				font-size: 85%;
			}

			> .suspended {
				color: var(--error);
				border-color: var(--error);
			}

			> .silenced {
				color: var(--warn);
				border-color: var(--warn);
			}

			> .moderator {
				color: var(--success);
				border-color: var(--success);
			}
		}
	}
}

.cmhjzshm {
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

.uawsfosz {

	> .meter {
		$size: 12px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: math.div($size, 2);
		overflow: hidden;

		> div {
			height: $size;
			border-radius: math.div($size, 2);
		}
	}
}
</style>

<style lang="scss" module>
.ip {
	display: flex;

	> :global(.date) {
		opacity: 0.7;
	}

	> :global(.ip) {
		margin-left: auto;
	}
}
</style>
