<template>
    <div class="preview-container">
        <div
            :class="['chart-container', { blur: loadingChart }]"
        >
            <HighchartsChart
                :key="chartKey"
                ref="chart"
                class="chart"
                :highcharts="Highcharts"
                :options="chartComponentOptions"
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
import { defineComponent, type ComponentPublicInstance } from 'vue';
import { mapState } from 'pinia';
import { Chart } from 'highcharts-vue';
import type { Chart as HighchartsChartInstance, Options } from 'highcharts';
import Highcharts from '../core/highchartsSetup';
import spinnerIcon from '../assets/circle-notch-solid.svg';
import { useDataStore } from '../store/modules/data';
import { useViewStore } from '../store/modules/view';

// The highcharts-vue component instance, as seen through a template ref
interface ChartComponent extends ComponentPublicInstance {
    chart?: HighchartsChartInstance;
}

export default defineComponent({
    components: {
        HighchartsChart: Chart
    },

    setup() {
        // The app's Highcharts instance, with its modules, for highcharts-vue
        // to create the chart with. Returned from setup so that Vue does not
        // make it reactive.
        return { Highcharts };
    },

    data() {
        return {
            spinnerIcon,
            // Changed to make highcharts-vue create the chart again
            chartKey: 0,
            // Whether highcharts-vue creates the chart from fallback options,
            // after Highcharts threw on the editor's options
            createFromFallback: false,
            // Whether the chart was created from the fallback options, and
            // has not been updated with the editor's options since
            startedFromFallback: false,
            // Whether Highcharts threw on the latest options update
            chartUpdateFailed: false,
            // The last chart error announced, and when it last occurred
            lastChartError: { message: '', time: 0 }
        };
    },

    computed: {
        ...mapState(useDataStore, ['tableCSV']),
        ...mapState(useViewStore, ['reactToParameterUpdates', 'loadingChart']),

        chartOptions(): Options {
            return this.$chartBridge.reactiveGet(
                'buildChartOptions', this.reactToParameterUpdates, this.tableCSV
            ) || {};
        },

        // The options highcharts-vue creates the chart from, and then
        // updates it with whenever they change
        chartComponentOptions(): Options {
            return this.createFromFallback ?
                this.$chartBridge.buildFallbackChartOptions() :
                this.chartOptions;
        }
    },

    watch: {
        // highcharts-vue updates the chart in its own options watcher, which
        // runs while this component is patched, so before this 'post'
        // watcher. Options the chart took end the failure: the next error is
        // news, even within two seconds, and the chart shows the editor's
        // settings, not only the fallback options.
        chartComponentOptions: {
            handler() {
                if (this.chartUpdateFailed) {
                    this.chartUpdateFailed = false;
                    return;
                }
                this.startedFromFallback = false;
                this.lastChartError = { message: '', time: 0 };
            },
            flush: 'post'
        }
    },

    mounted() {
        this.$nextTick(() => this.initChart());
    },

    // Highcharts throws on options it can not render (e.g. error #17 for an
    // unknown series type). Thrown from highcharts-vue, such an error would
    // abort Vue's update of the editor and leave it broken, so log it and
    // keep the app running. After an error in an update, the chart is still
    // there and takes the next options it can render, so just tell the
    // user. An error while the chart is created leaves no chart, which
    // initChart() handles.
    errorCaptured(error: unknown) {
        if (this.getChart()) {
            console.error('Could not update the chart:', error);
            this.chartUpdateFailed = true;
            this.announceChartError(this.startedFromFallback ?
                // It may never have shown the editor's settings: the user
                // did not necessarily change anything
                'The chart could not be shown with the current settings.' :
                'The chart could not be updated.');
        } else {
            console.error('Could not create the chart:', error);
        }
        return false;
    },

    beforeUnmount() {
        // Stop playback first, which also ends the chart bridge's progress
        // polling: it would otherwise keep updating the store after
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
    },

    methods: {
        getChart(): HighchartsChartInstance | undefined {
            return (this.$refs.chart as ChartComponent | undefined)?.chart;
        },

        // Hand the chart highcharts-vue created to the rest of the editor
        initChart() {
            const chart = this.getChart();
            if (!chart) {
                this.onChartNotCreated();
                return;
            }

            // From now on highcharts-vue updates the chart with the
            // editor's options
            this.startedFromFallback = this.createFromFallback;
            this.createFromFallback = false;
            // Updates the chart with the editor's options, which gives it the
            // series settings, and the components that depend on the chart
            // their data. The rows are left as they are: parsing them again
            // from the CSV would drop their empty cells, and a column without
            // cells has no series, which would move the series settings of
            // the columns after it to other columns (see buildChartOptions).
            this.$chartBridge.init(chart);
            if (this.startedFromFallback) {
                // init() derived options from the fallback chart, which has
                // no data (e.g. no data range for the audio contexts' "too
                // small interval" check), so derive them again once the
                // editor's options and data have reached the chart
                this.$chartBridge.forceUpdate(true);
            }
        },

        // Highcharts threw while it created the chart. A chart created again
        // (after New Project, Open Project or a return to the editor) gets
        // the parameters the chart bridge last had, not only the data, and
        // they may be options Highcharts can not render. Without a chart, the
        // bridge stops passing on changes and the chart would stay blank, so
        // create it from fallback options, then hand it the editor's options
        // as an update. Should they still fail, that is an update error,
        // after which the chart takes the next options it can render.
        onChartNotCreated() {
            this.destroyFailedChart();

            if (this.createFromFallback) {
                // Not even the fallback options gave a chart
                this.announceChartError('The chart could not be created.');
                return;
            }

            this.createFromFallback = true;
            this.chartKey++;
            this.$nextTick(() => this.initChart());
        },

        // Highcharts keeps a chart that threw while it was created in
        // Highcharts.charts. Destroy it, so that it holds no memory or event
        // listeners, and is not taken for the editor's chart later.
        destroyFailedChart() {
            // The element highcharts-vue renders the chart to
            const element = (this.$refs.chart as ChartComponent | undefined)?.$el;
            if (!element) {
                return;
            }
            const failedChart = Highcharts.charts.find(
                (chart) => chart?.container?.parentNode === element
            );
            try {
                failedChart?.destroy();
            } catch {
                // A chart that threw early on may lack parts destroy() expects
            }
        },

        // Announce a chart error, unless it repeats the last one within two
        // seconds of its last occurrence: one change can make Highcharts
        // throw more than once (e.g. on the options, then on the data parsed
        // with them, then on a queued refresh), which the user needs to hear
        // only once. An update that works in between clears the last error
        // (see the chartComponentOptions watcher).
        announceChartError(message: string) {
            const now = Date.now();
            const last = this.lastChartError;
            const isRepeat = message === last.message && now - last.time < 2000;
            this.lastChartError = { message, time: now };
            if (!isRepeat) {
                this.$announcer.announce(message);
            }
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
