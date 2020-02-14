import { GenericObject } from './utils/objects';
import { getChartOptionsFromParameters } from './optionsMapper/optionsMapper';
import { Store } from 'vuex';

/**
 * Interface between chart-specific logic and the rest of the
 * app.
 */
export class ChartBridge {

    private static updateChartIntervalMs = 500;
    private static updateProgressIntervalMs = 20;
    private chart: GenericObject|null = null;
    private chartOptions: GenericObject = {};
    private chartParametersStore: GenericObject;
    private sonifyParametersStore: GenericObject;
    private commitToStore: (id: string, payload?: any) => void;
    private updateChartTimeout: number|null = null;
    private updateProgressInterval: number|null = null;

    constructor(store: Store<any>) {
        this.chartParametersStore = store.state.chartParametersStore;
        this.sonifyParametersStore = store.state.sonifyParametersStore;
        this.commitToStore = (id: string, payload?: any) => store.commit(id, payload);

        store.subscribe(this.onStoreMutation.bind(this));
    }


    /**
     * Init the class with a chart and Vuex store instance.
     */
    public init(chart: GenericObject) {
        this.chart = chart;
        this.updateChartOptions();
    }


    /**
     * The chart bridge always holds the computed chart options from
     * the parameter stores.
     */
    public getCurrentChartOptions(updateCounter: number) {
        // The purpose of the update counter is to provoke Vue reactivity,
        // so that the preview will update when we update the counter in
        // the viewStore. It also serves as a debugging tool, to identify
        // the number of updates happening to the chart, and identify them
        // sequentially.
        this.chartOptions._seUpdateCounter = updateCounter;
        return this.chartOptions;
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


    private updateChartOptions() {
        this.chartOptions = getChartOptionsFromParameters(
            this.sonifyParametersStore,
            this.chartParametersStore
        );
        this.commitToStore('viewStore/incrementChartOptionsUpdateCounter');
    }


    private onStoreMutation(mutation: GenericObject) {
        if (this.shouldUpdateOnMutation(mutation)) {
            this.queueChartOptionsUpdate();
        }
    }


    private shouldUpdateOnMutation(mutation: GenericObject): boolean {
        return mutation.type.startsWith('chartParameters') ||
            mutation.type.startsWith('sonifyParameters');
    }


    // Limit number of chart updates to one every X milliseconds
    private queueChartOptionsUpdate() {
        if (!this.updateChartTimeout) {
            this.updateChartTimeout = setTimeout(() => {
                this.updateChartOptions();
                this.updateChartTimeout = null;
            }, ChartBridge.updateChartIntervalMs);
        }
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

        const cursor = timeline.getCursor();
        const curTime = Object.values(cursor).reduce((acc: number, cur: any) => cur.time, 0);
        const totalDuration = sonification.duration;
        const progressPercentage = Math.round(curTime / totalDuration * 100);

        return progressPercentage;
    }
}
