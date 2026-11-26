<template>
    <div class="preview-container">
        <div
            :class="['chart-container', { blur: loadingChart }]"
        >
            <HighchartsChart
                ref="chart"
                class="chart"
                :options="chartOptions"
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
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Chart } from 'highcharts-vue';
import type { Chart as HighchartsChartInstance, Options } from 'highcharts';
import spinnerIcon from '../assets/circle-notch-solid.svg';

// The highcharts-vue component instance, as seen through a template ref
interface ChartComponent {
    chart?: HighchartsChartInstance;
}

export default defineComponent({
    components: {
        HighchartsChart: Chart
    },

    data() {
        return {
            spinnerIcon
        };
    },

    computed: {
        ...mapState('dataStore', ['tableCSV']),
        ...mapState('viewStore', ['reactToParameterUpdates', 'loadingChart']),

        chartOptions(): Options {
            return this.$chartBridge.reactiveGet(
                'buildChartOptions', this.reactToParameterUpdates, this.tableCSV
            ) || {};
        }
    },

    mounted() {
        this.$nextTick(() => {
            const chart = (this.$refs.chart as ChartComponent | undefined)?.chart;
            if (chart) {
                const chartBridge = this.$chartBridge;
                chartBridge.init(chart);

                const csv = this.$store.state.dataStore.tableCSV;
                this.$store.dispatch('dataStore/loadFromCSV', csv); // ✅ safe to call now
            }
        });
    },

    beforeUnmount() {
        // Stop playback first, which also ends the chart bridge's progress
        // polling: it would otherwise keep committing to the store after
        // the chart is gone.
        this.$chartBridge.stopChart();

        // highcharts-vue 2.0.2 does not destroy its chart when unmounted (its
        // beforeUnmount hook is an arrow function without access to the
        // component), so destroy it here, as highcharts-vue 1 did on Vue 2.
        // Clearing the reference keeps a fixed highcharts-vue from destroying
        // it twice.
        const chartComponent = this.$refs.chart as ChartComponent | undefined;
        if (chartComponent?.chart) {
            chartComponent.chart.destroy();
            chartComponent.chart = undefined;
        }
    }
});
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
    .hc-fade-enter-from, .hc-fade-leave-to {
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
