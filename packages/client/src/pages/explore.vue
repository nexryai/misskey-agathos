<template>
<MkStickyContainer>
    <template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
    <div class="lznhrdub">
        <div v-if="tab === 'notes'">
            <MkSpacer :content-max="1200">
                <div>
                    <MkInput v-model="searchQuery" :debounce="true" type="search" class="_formBlock">
                        <template #prefix><i class="ti ti-search"></i></template>
                        <template #label>{{ i18n.ts.search }}</template>
                    </MkInput>
                </div>

                <XNotes v-if="searchQuery" ref="notes" :pagination="searchPagination"/>
            </MkSpacer>
        </div>

        <div v-else-if="tab === 'users'">
            <MkSpacer :content-max="1200">
                <div>
                    <MkInput v-model="userSearchQuery" :debounce="true" type="search" class="_formBlock">
                        <template #prefix><i class="ti ti-search"></i></template>
                        <template #label>{{ i18n.ts.searchUser }}</template>
                    </MkInput>
                    <MkRadios v-model="userSearchOrigin" class="_formBlock">
                        <option value="combined">{{ i18n.ts.all }}</option>
                        <option value="local">{{ i18n.ts.local }}</option>
                        <option value="remote">{{ i18n.ts.remote }}</option>
                    </MkRadios>
                </div>

                <XUserList v-if="userSearchQuery" ref="searchEl" class="_gap" :pagination="userSearchPagination"/>
            </MkSpacer>
        </div>
    </div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import MkFolder from "@/components/MkFolder.vue";
import MkInput from "@/components/form/input.vue";
import MkRadios from "@/components/form/radios.vue";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import XNotes from "@/components/MkNotes.vue";
import XUserList from "@/components/MkUserList.vue";

const props = defineProps<{
	tag?: string;
}>();

let tab = ref("notes");
let tagsEl = ref<InstanceType<typeof MkFolder>>();
let searchQuery = ref("");
let userSearchQuery = ref("");
let userSearchOrigin = ref("combined");

watch(() => props.tag, () => {
    if (tagsEl.value) tagsEl.value.toggleContent(props.tag == null);
});

const searchPagination = {
    endpoint: "notes/search" as const,
    limit: 10,
    params: computed(() => ({
        query: searchQuery.value,
    })),
};

const userSearchPagination = {
    endpoint: "users/search" as const,
    limit: 10,
    params: computed(() => (userSearchQuery.value !== "") ? {
        query: userSearchQuery.value,
        origin: userSearchOrigin.value,
    } : null),
};

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
    key: "notes",
    icon: "ti ti-bolt",
    title: i18n.ts.notes,
}, {
    key: "users",
    icon: "ti ti-users",
    title: i18n.ts.users,
}]);

definePageMetadata(computed(() => ({
    title: i18n.ts.explore,
    icon: "ti ti-hash",
})));
</script>
