<template>
<div class="_formRoot">
    <FormLink class="_formBlock" @click="configure"><template #icon><i class="ti ti-settings"></i></template>{{ i18n.ts.notificationSetting }}</FormLink>
    <FormSection>
        <FormLink class="_formBlock" @click="readAllNotifications">{{ i18n.ts.markAsReadAllNotifications }}</FormLink>
        <FormLink class="_formBlock" @click="readAllUnreadNotes">{{ i18n.ts.markAsReadAllUnreadNotes }}</FormLink>
    </FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from "vue";
import { notificationTypes } from "@/const";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import * as os from "@/os";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

async function readAllUnreadNotes() {
    await os.api("i/read-all-unread-notes");
}

async function readAllNotifications() {
    await os.api("notifications/mark-all-as-read");
}

function configure() {
    const includingTypes = notificationTypes.filter(x => !$i!.mutingNotificationTypes.includes(x));
    os.popup(defineAsyncComponent(() => import("@/components/MkNotificationSettingWindow.vue")), {
        includingTypes,
        showGlobalToggle: false,
    }, {
        done: async (res) => {
            const { includingTypes: value } = res;
            await os.apiWithDialog("i/update", {
                mutingNotificationTypes: notificationTypes.filter(x => !value.includes(x)),
            }).then(i => {
				$i!.mutingNotificationTypes = i.mutingNotificationTypes;
            });
        },
    }, "closed");
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
    title: i18n.ts.notifications,
    icon: "ti ti-bell",
});
</script>
