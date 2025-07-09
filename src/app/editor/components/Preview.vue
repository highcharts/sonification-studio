<template>
    <div class="preview-container">
        <div
            :class="['chart-container', { blur: loadingChart }]"
        >
            <highcharts
                ref="chart"
                class="chart"
                :options="chartOptions"
                :update-args="[true, true]"
                :constructor-type="'stockChart'"
            />
        </div>
        <transition
            appear
            name="hc-fade"
        >
            <div
                v-show="loadingChart"
                class="loading-overlay"
            >
                <img
                    alt=""
                    :src="spinnerIcon"
                >
                <p>Loading chart...</p>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import spinnerIcon from '../assets/circle-notch-solid.svg';

export default {
    data() {
        return {
            spinnerIcon
        };
    },

    computed: {
        ...mapState({
            tableCSV: (state: any) => state.dataStore.tableCSV,
            reactToParameterUpdates: (state: any) => state.viewStore.reactToParameterUpdates,
            loadingChart: (state: any) => state.viewStore.loadingChart
        }),

        chartOptions() {
            const chartBridge = (this as any)?.$chartBridge;
            return chartBridge
                ?.reactiveGet('buildChartOptions', this.reactToParameterUpdates, this.tableCSV) ||
                {};
        }
    },
    watch: {
        // Wait until <highcharts> has mounted and provided a chart
        '$refs.chart'(val) {
            const chart = (this.$refs.chart as any)?.chart;
            if (chart && !(this as any).$chartBridge.chart) {
                (this as any).$chartBridge.init(chart);
            }
        },
    },

    mounted() {
        // Init ChartBridge with reference to chart
        this.$nextTick(() => {
            const chart = (this.$refs.chart as any)?.chart;
            if (chart) {
                (this as any).$chartBridge.init(chart);
            }
        });
    }

};
</script>

<style lang="less" scoped>
    @import "../colors";

    .preview-container {
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
        padding-top: 25px;
        transition: filter 0.3s;
    }

    .blur {
        filter: blur(7px);
    }

    .hc-fade-enter-active, .hc-fade-leave-active {
        transition: opacity 0.1s;
    }
    .hc-fade-enter, .hc-fade-leave-to {
        will-change: opacity;
        opacity: 0;
    }

    .chart {
        height: 100%;
    }

    .loading-overlay {
        color: #222;
        font-size: 1.2em;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 0.88;
        background-color: #fff;
        img {
            width: 28px;
            height: 28px;
            display: block;
            opacity: 0.7;
            animation: hc-spin 1s linear infinite;
        }
        p {
            margin-top: 10px;
        }
    }

    @keyframes hc-spin {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>
