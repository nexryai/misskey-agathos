<template>
<div class="zbcjwnqg">
    <div class="main">
        <div class="body">
            <div class="selects" style="display: flex;">
                <MkSelect v-model="chartSrc" style="margin: 0; flex: 1;">
                    <optgroup :label="i18n.ts.federation">
                        <option value="federation">{{ i18n.ts._charts.federation }}</option>
                        <option value="ap-request">{{ i18n.ts._charts.apRequest }}</option>
                    </optgroup>
                    <optgroup :label="i18n.ts.users">
                        <option value="users">{{ i18n.ts._charts.usersIncDec }}</option>
                        <option value="users-total">{{ i18n.ts._charts.usersTotal }}</option>
                        <option value="active-users">{{ i18n.ts._charts.activeUsers }}</option>
                    </optgroup>
                    <optgroup :label="i18n.ts.notes">
                        <option value="notes">{{ i18n.ts._charts.notesIncDec }}</option>
                        <option value="local-notes">{{ i18n.ts._charts.localNotesIncDec }}</option>
                        <option value="remote-notes">{{ i18n.ts._charts.remoteNotesIncDec }}</option>
                        <option value="notes-total">{{ i18n.ts._charts.notesTotal }}</option>
                    </optgroup>
                    <optgroup :label="i18n.ts.drive">
                        <option value="drive-files">{{ i18n.ts._charts.filesIncDec }}</option>
                        <option value="drive">{{ i18n.ts._charts.storageUsageIncDec }}</option>
                    </optgroup>
                </MkSelect>
                <MkSelect v-model="chartSpan" style="margin: 0 0 0 10px;">
                    <option value="hour">{{ i18n.ts.perHour }}</option>
                    <option value="day">{{ i18n.ts.perDay }}</option>
                </MkSelect>
            </div>
            <div class="chart">
                <MkChart :src="chartSrc" :span="chartSpan" :limit="chartLimit" :detailed="detailed"></MkChart>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts" setup>
import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    LineController,
    CategoryScale,
    LinearScale,
    TimeScale,
    Legend,
    Title,
    Tooltip,
    SubTitle,
    Filler,
    DoughnutController,
} from "chart.js";
import MkSelect from "@/components/form/select.vue";
import MkChart from "@/components/MkChart.vue";
import { i18n } from "@/i18n";

Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    LineController,
    DoughnutController,
    CategoryScale,
    LinearScale,
    TimeScale,
    Legend,
    Title,
    Tooltip,
    SubTitle,
    Filler,
);

const props = withDefaults(defineProps<{
	chartLimit?: number;
	detailed?: boolean;
}>(), {
    chartLimit: 90,
});

const chartSpan = $ref<"hour" | "day">("hour");
const chartSrc = $ref("active-users");
</script>

<style lang="scss" scoped>
.zbcjwnqg {
	> .main {
		background: var(--panel);
		border-radius: var(--radius);
		padding: 24px;
		margin-bottom: 16px;

		> .body {
			> .chart {
				padding: 8px 0 0 0;
			}
		}
	}

	> .subpub {
		display: flex;
		gap: 16px;

		> .sub, > .pub {
			flex: 1;
			min-width: 0;
			position: relative;
			background: var(--panel);
			border-radius: var(--radius);
			padding: 24px;
			max-height: 300px;

			> .title {
				position: absolute;
				top: 24px;
				left: 24px;
			}
		}

		@media (max-width: 600px) {
			flex-direction: column;
		}
	}
}
</style>
