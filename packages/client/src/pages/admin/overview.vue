<template>
<MkSpacer :content-max="900">
    <div ref="rootEl" v-size="{ max: [740] }" class="edbbcaef">
        <div class="left">
            <div v-if="stats" class="container stats">
                <div class="title">Stats</div>
                <div class="body">
                    <div class="number _panel">
                        <div class="label">Users</div>
                        <div class="value _monospace">
                            {{ number(stats.originalUsersCount) }}
                            <MkNumberDiff v-if="usersComparedToThePrevDay != null" v-tooltip="i18n.ts.dayOverDayChanges" class="diff" :value="usersComparedToThePrevDay"><template #before>(</template><template #after>)</template></MkNumberDiff>
                        </div>
                    </div>
                    <div class="number _panel">
                        <div class="label">Notes</div>
                        <div class="value _monospace">
                            {{ number(stats.originalNotesCount) }}
                            <MkNumberDiff v-if="notesComparedToThePrevDay != null" v-tooltip="i18n.ts.dayOverDayChanges" class="diff" :value="notesComparedToThePrevDay"><template #before>(</template><template #after>)</template></MkNumberDiff>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container queue">
                <div class="title">Job queue</div>
                <div class="body">
                    <div class="chart deliver">
                        <div class="title">Deliver</div>
                        <XQueueChart :connection="queueStatsConnection" domain="deliver"/>
                    </div>
                    <div class="chart inbox">
                        <div class="title">Inbox</div>
                        <XQueueChart :connection="queueStatsConnection" domain="inbox"/>
                    </div>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="container env">
                <div class="title">Enviroment</div>
                <div class="body">
                    <div class="number _panel">
                        <div class="label">Server Version</div>
                        <div class="value _monospace">{{ version }}</div>
                    </div>
                    <div v-if="serverInfo" class="number _panel">
                        <div class="label">Node.js</div>
                        <div class="value _monospace">{{ serverInfo.node }}</div>
                    </div>
                    <div v-if="serverInfo" class="number _panel">
                        <div class="label">PostgreSQL</div>
                        <div class="value _monospace">{{ serverInfo.psql }}</div>
                    </div>
                    <div v-if="serverInfo" class="number _panel">
                        <div class="label">Redis</div>
                        <div class="value _monospace">{{ serverInfo.redis }}</div>
                    </div>
                    <div class="number _panel">
                        <div class="label">Vue</div>
                        <div class="value _monospace">{{ vueVersion }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</MkSpacer>
</template>

<script lang="ts" setup>
import { ref, markRaw, version as vueVersion, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
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
} from "chart.js";
import XQueueChart from "./overview.queue-chart.vue";
import MkNumberDiff from "@/components/MkNumberDiff.vue";
import { version } from "@/config";
import number from "@/filters/number";
import * as os from "@/os";
import { stream } from "@/stream";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import "chartjs-adapter-date-fns";

Chart.register(
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
    //gradient,
);

const rootEl = ref<HTMLElement>();
let stats: any = ref(null);
let serverInfo: any = ref(null);
let usersComparedToThePrevDay: any = ref(null);
let notesComparedToThePrevDay: any = ref(null);
const queueStatsConnection = markRaw(stream.useChannel("queueStats"));

onMounted(async () => {
    /*
	const magicGrid = new MagicGrid({
		container: rootEl,
		static: true,
		animate: true,
	});

	magicGrid.listen();
	*/

    os.api("stats", {}).then(statsResponse => {
        stats.value = statsResponse;
    });

    os.api("admin/server-info").then(serverInfoResponse => {
        serverInfo.value = serverInfoResponse;
    });

    nextTick(() => {
        queueStatsConnection.send("requestLog", {
            id: Math.random().toString().substr(2, 8),
            length: 100,
        });
    });
});

onBeforeUnmount(() => {
    queueStatsConnection.dispose();
});

definePageMetadata({
    title: i18n.ts.dashboard,
    icon: "ti ti-dashboard",
});
</script>

<style lang="scss" scoped>
.edbbcaef {
	display: flex;

	> .left, > .right {
		box-sizing: border-box;
		width: 50%;

		> .container {
			margin: 32px 0;

			> .title {
				font-weight: bold;
				margin-bottom: 16px;
			}

			&.stats, &.federationStats {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .number {
						padding: 14px 20px;

						> .label {
							opacity: 0.7;
							font-size: 0.8em;
						}

						> .value {
							font-weight: bold;
							font-size: 1.5em;

							> .diff {
								font-size: 0.7em;
							}
						}
					}
				}
			}

			&.env {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .number {
						padding: 14px 20px;

						> .label {
							opacity: 0.7;
							font-size: 0.8em;
						}

						> .value {
							font-size: 1.1em;
						}
					}
				}
			}

			&.charts {
				> .body {
					padding: 32px;
					background: var(--panel);
					border-radius: var(--radius);
				}
			}

			&.users {
				> .body {
					background: var(--panel);
					border-radius: var(--radius);

					> .user {
						padding: 16px 20px;

						&:not(:last-child) {
							border-bottom: solid 0.5px var(--divider);
						}
					}
				}
			}

			&.federation {
				> .body {
					background: var(--panel);
					border-radius: var(--radius);
					overflow: clip;
				}
			}

			&.queue {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .chart {
						position: relative;
						padding: 20px;
						background: var(--panel);
						border-radius: var(--radius);

						> .title {
							position: absolute;
							top: 20px;
							left: 20px;
							font-size: 90%;
						}
					}
				}
			}

			&.federationPies {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .chart {
						position: relative;
						padding: 20px;
						background: var(--panel);
						border-radius: var(--radius);

						> .title {
							position: absolute;
							top: 20px;
							left: 20px;
							font-size: 90%;
						}

						> .subTitle {
							position: absolute;
							bottom: 20px;
							right: 20px;
							font-size: 85%;
						}
					}
				}
			}

			&.tagCloud {
				> .body {
					background: var(--panel);
					border-radius: var(--radius);
					overflow: clip;
				}
			}
		}
	}

	> .left {
		padding-right: 16px;
	}

	> .right {
		padding-left: 16px;
	}
}
</style>
