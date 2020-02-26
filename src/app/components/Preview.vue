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

export default {
    computed: {
        ...mapState({
            tableCSV: (state: any) => state.dataStore.tableCSV,
            reactToParameterUpdates: (state: any) => state.viewStore.reactToParameterUpdates,
        }),

        chartOptions() {
            const chartBridge = (this as any)?.$chartBridge;
            return chartBridge
                ?.reactiveGet('buildChartOptions', this.reactToParameterUpdates, this.tableCSV) ||
                {};
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
