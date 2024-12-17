<template>
<MkPagination ref="pagingComponent" :pagination="pagination">
    <template #empty>
        <div class="_fullinfo">
            <i class="ti ti-exclamation-mark"></i>
            <div>{{ i18n.ts.noNotes }}</div>
        </div>
    </template>

    <template #default="{ items: notes }">
        <div class="giivymft" :class="{ noGap }">
            <XList ref="notes" v-slot="{ item: note }" :items="notes" :direction="pagination.reversed ? 'up' : 'down'" :reversed="pagination.reversed" :no-gap="false" :ad="true" class="notes">
                <XNote :key="note._featuredId_ || note._prId_ || note.id" class="qtqtichx"
                       :note="note"
                       :mute-person-not-welcome="props.mutePersonNotWelcome"
                />
            </XList>
        </div>
    </template>
</MkPagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import XNote from "@/components/MkNote.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import MkPagination, { Paging } from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";

const props = defineProps<{
	pagination: Paging;
    mutePersonNotWelcome?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

defineExpose({
    pagingComponent,
});
</script>

<style lang="scss" scoped>
.giivymft {
    > .notes {
        background: var(--bg);

        .qtqtichx {
            background: var(--panel);
            border-radius: var(--radius);
            border: solid 1px var(--divider);
        }
    }
}
</style>
