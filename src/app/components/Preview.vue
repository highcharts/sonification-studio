<template>
    <section aria-label="Chart preview">
        <div
            class="chart-container"
            role="image"
        >
            <highcharts
                ref="chart"
                class="chart"
                :options="chartOptions"
            />
        </div>
    </section>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { deepMerge, GenericObject } from '../../core/utils/objects';
import { getSeriesId } from '../../core/utils/chartUtils';
import { defaultChartOptions } from '../../core/defaultChartOptions';

export default {
    computed: {
        ...mapState({
            tableCSV: (state: any) => state.dataStore.tableCSV,
            reactToParameterUpdates: (state: any) => state.viewStore.reactToParameterUpdates,
        }),

        parameterOptions() {
            const chartBridge = (this as any)?.$chartBridge;
            return chartBridge
                ?.reactiveGet('getCurrentChartOptions', this.reactToParameterUpdates) ||
                {};
        },

        chartOptions() {
            // Need to update the data first to know which (new) series to build options for.
            // Only once the CSV has been parsed can we build the series options.
            const newOptions = Object.assign({
                data: {
                    csv: this.tableCSV || 'null',

                    complete: (parseResult: GenericObject) => {
                        const chart = (this.$refs.chart as any).chart;
                        const chartBridge = (this as any).$chartBridge;

                        if (chart && chartBridge) {
                            // Get ids of series parsed
                            const seriesIds = (parseResult.series || []).map((s: GenericObject, ix: number) => {
                                s.chart = { index: chart.index };
                                s.index = ix;
                                return getSeriesId(s);
                            });

                            // Extend parsed results with series options
                            const seriesOptions = chartBridge.buildSeriesOptions(seriesIds);
                            if (seriesOptions) {
                                parseResult.series = deepMerge(parseResult.series, seriesOptions);
                            }
                        }
                    }
                }
            }, this.parameterOptions);

            return deepMerge(defaultChartOptions, newOptions);
        }
    },

    mounted: function () {
        // Init ChartBridge with reference to chart
        const chart = (this.$refs.chart as any).chart;
        (this as any).$chartBridge.init(chart);
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        background-color: @main-content-bg-color;
        position: relative;
    }

    .chart-container {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        padding: 30px;
    }

    .chart {
        height: 100%;
    }
</style>
