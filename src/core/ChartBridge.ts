import { GenericObject } from './utils/objects';
import { getChartOptionsFromParameters } from './optionsMapper/optionsMapper';
import { Store } from 'vuex';

/**
 * Interface between chart-specific logic and the rest of the
 * app.
 */
export class ChartBridge {

    // How often to trigger updates for parameter changes
    private static parameterReactivityIntervalMs = 300;
    // How often to trigger updates for data changes
    private static dataReactivityIntervalMs = 1000;
    // Playback progress bar update interval
    private static updateProgressIntervalMs = 15;

    private chart: GenericObject|null = null;
    private chartOptions: GenericObject = {};
    private chartParametersStore: GenericObject;
    private seriesParametersStore: GenericObject;
    private sonifyParametersStore: GenericObject;
    private commitToStore: (id: string, payload?: any) => void;
    private reactivityTimeouts: GenericObject = {};
    private updateProgressInterval: number|null = null;
    private _seReactivityCounter: number|null = null;


    constructor(store: Store<any>) {
        this.chartParametersStore = store.state.chartParametersStore;
        this.seriesParametersStore = store.state.seriesParametersStore;
        this.sonifyParametersStore = store.state.sonifyParametersStore;
        this.commitToStore = (id: string, payload?: any) => store.commit(id, payload);

        store.subscribe(this.onStoreMutation.bind(this));
    }


    /**
     * Init the class with a chart and Vuex store instance.
     */
    public init(chart: GenericObject): void {
        this.chart = chart;
        this.updateChartOptions();

        // Once we have a chart, we need to trigger reactivity again to force updates
        this.commitToStore('viewStore/triggerParameterReactivity');
        this.commitToStore('viewStore/triggerDataReactivity');
    }


    /**
     * Force chart to update sizing. Sometimes needed when the chart
     * container switches from being invisible to visible.
     */
    public reflowChart(): void {
        setTimeout(() => this.chart?.reflow(), 10);
    }


    /**
     * The purpose of this function is to create a dependency on a
     * reactive property (reactivityCounter) that can be changed elsewhere
     * in the code, and force updates of props that depend on chartBridge
     * functions.
     *
     * This is particularly useful for non-POD structures that contain
     * functions, as they can not be stored in a Vuex store. For example,
     * for components that depend on chart data series objects.
     *
     * Two reactivity counters are provided in the view store,
     * reactToDataUpdates, and reactToParameterUpdates. These are
     * incremented by the ChartBridge class when relevant updates are made.
     *
     * Example:
     *
     * Add a computed property "test" that is computed as follows:
     *      test: () => this.$chartBridge.reactiveGet(
     *              'getCurrentChartOptions', this.reactToParameterUpdates);
     *
     * Whenever "this.reactToParameterUpdates" is updated (e.g. incremented),
     * the value of "test" will update as well, and fetch its result from
     * "getCurrentChartOptions".
     */
    public reactiveGet(func: keyof ChartBridge, reactivityCounter: number): any {
        this._seReactivityCounter = reactivityCounter;

        const res = (this as any)[func]();

        if (typeof res === 'object' && res) {
            res._seReactivityCounter = this._seReactivityCounter;
        }

        return res;
    }


    public getCurrentChartOptions() {
        return this.chartOptions;
    }


    public getDataSeries(): Array<GenericObject> {
        return this.chart?.series || [];
    }


    public getSeriesId(series: GenericObject): string {
        return series.id || `se-hc-series-id-${series.chart.index}-${series.index}`;
    }


    public isPaused(): boolean {
        const timeline = this.chart?.sonification.timeline;
        return timeline && !timeline.atStart();
    }


    public playChart(onEnd?: (e: any) => void) {
        const chart = this.chart;
        if (!chart || this.isPlaying()) {
            return;
        }

        this.startProgressUpdatePolling();

        if (!this.isPaused()) {
            chart.sonify({
                onEnd: (e: any) => {
                    this.stopChart();
                    if (onEnd) {
                        onEnd(e);
                    }
                }
            });
        } else {
            chart.resumeSonify();
        }
    }


    public stopChart() {
        this.stopProgressUpdatePolling();
        this.chart?.cancelSonify();
        this.updatePlayProgress();
    }


    public pauseChart() {
        this.stopProgressUpdatePolling();
        this.chart?.pauseSonify();
    }


    public loopChart() {
        this.playChart(this.loopChart.bind(this));
    }


    private isPlaying(): boolean {
        return !!Object.keys(this.chart?.sonification?.timeline?.pathsPlaying || {}).length;
    }


    private onStoreMutation(mutation: GenericObject) {
        if (this.isParameterMutation(mutation)) {
            this.queueReactivityUpdate(
                'viewStore/triggerParameterReactivity',
                ChartBridge.parameterReactivityIntervalMs,
                'paramReactivityTimeout',
                () => this.updateChartOptions()
            );
        } else if (this.isDataMutation(mutation)) {
            this.queueReactivityUpdate(
                'viewStore/triggerDataReactivity',
                ChartBridge.dataReactivityIntervalMs,
                'dataReactivityTimeout'
            );
        }
    }


    private isParameterMutation(mutation: GenericObject): boolean {
        return mutation.type.startsWith('chartParameters') ||
            mutation.type.startsWith('seriesParameters') ||
            mutation.type.startsWith('sonifyParameters');
    }


    private isDataMutation(mutation: GenericObject): boolean {
        return mutation.type.startsWith('dataStore');
    }


    // Trigger a reactivity update, but only once every X milliseconds.
    private queueReactivityUpdate(
        mutation: string, interval: number, timeoutId: string, beforeTrigger?: Function
    ) {
        const timeouts = this.reactivityTimeouts;
        if (!timeouts[timeoutId]) {
            timeouts[timeoutId] = setTimeout(() => {
                delete timeouts[timeoutId];
                if (beforeTrigger) {
                    beforeTrigger();
                }
                this.commitToStore(mutation);
            }, interval);
        }
    }


    // Chart options are cached for performance, only updated on reactivity trigger
    private updateChartOptions() {
        this.chartOptions = getChartOptionsFromParameters(
            this.sonifyParametersStore,
            this.chartParametersStore,
            this.seriesParametersStore
        );
    }


    private startProgressUpdatePolling() {
        this.stopProgressUpdatePolling();
        this.updateProgressInterval = setInterval(
            this.updatePlayProgress.bind(this), ChartBridge.updateProgressIntervalMs
        );
    }


    private stopProgressUpdatePolling() {
        if (this.updateProgressInterval) {
            clearInterval(this.updateProgressInterval);
        }
    }


    private updatePlayProgress() {
        const progressPct = this.getCurrentPlayProgressPct();
        this.commitToStore('viewStore/setPlaybackProgress', progressPct);
    }


    private getCurrentPlayProgressPct(): number {
        const sonification = this.chart?.sonification;
        const timeline = sonification?.timeline;

        if (!timeline || timeline.atStart()) {
            return 0;
        }

        const cursor: GenericObject = timeline.getCursor();
        const curTime = Object.values(cursor)[0].time;
        const totalDuration = sonification.duration;
        const progressPercentage = Math.round(curTime / totalDuration * 100);

        return progressPercentage;
    }
}
