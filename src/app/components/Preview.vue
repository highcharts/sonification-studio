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
import { deepMerge } from '../../core/utils/objects';
import { defaultChartOptions } from '../../core/defaultChartOptions';

export default {
    computed: {
        ...mapState({
            tableCSV: (state: any) => state.dataStore.tableCSV,
            chartOptionsUpdateCounter: (state: any) => state.viewStore.chartOptionsUpdateCounter,
        }),

        parameterOptions() {
            return (this as any)?.$chartBridge?.getCurrentChartOptions(
                this.chartOptionsUpdateCounter
            ) || {};
        },

        chartOptions() {
            const emptyCSV = 'x;y\n';
            const newOptions = Object.assign({
                data: {
                    csv: this.tableCSV || emptyCSV
                }
            }, this.parameterOptions);

            return deepMerge(defaultChartOptions, newOptions);
        }
    },

    mounted: function () {
        // Init ChartBridge with reference to chart
        (this as any).$chartBridge.init((this.$refs.chart as any).chart);
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
