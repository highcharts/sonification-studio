import { GenericObject } from './utils/objects';
import { getChartOptionsFromParameters } from './optionsMapper/optionsMapper';
import { Store } from 'vuex';

/**
 * Interface between chart-specific logic and the rest of the
 * app.
 */
export class ChartBridge {

    private static updateChartIntervalMs = 500;
    private chart: GenericObject|null = null;
    private chartOptions: GenericObject = {};
    private chartParametersStore: GenericObject;
    private sonifyParametersStore: GenericObject;
    private incrementUpdateCounter: () => void;
    private updateChartTimeout: number|null = null;


    constructor(store: Store<any>) {
        this.chartParametersStore = store.state.chartParametersStore;
        this.sonifyParametersStore = store.state.sonifyParametersStore;
        this.incrementUpdateCounter = () => {
            store.commit('viewStore/incrementChartOptionsUpdateCounter');
        };

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


    public playChart() {
        const chart = this.chart;
        if (!chart) {
            return;
        }

        if (!chart.sonification.timeline || chart.sonification.timeline.atStart()) {
            chart.sonify();
        } else {
            chart.resumeSonify();
        }
    }


    public stopChart() {
        this.chart?.cancelSonify();
    }


    public pauseChart() {
        this.chart?.pauseSonify();
    }


    public loopChart() {
        this.chart?.sonify({
            onEnd: (e: any) => {
                e.path.timeline.resetCursor();
                e.path.timeline.play();
            }
        });
    }


    private updateChartOptions() {
        this.chartOptions = getChartOptionsFromParameters(
            this.sonifyParametersStore,
            this.chartParametersStore
        );
        this.incrementUpdateCounter();
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


    // Limit number of updates to one every X milliseconds
    private queueChartOptionsUpdate() {
        if (!this.updateChartTimeout) {
            this.updateChartTimeout = setTimeout(() => {
                this.updateChartOptions();
                this.updateChartTimeout = null;
            }, ChartBridge.updateChartIntervalMs);
        }
    }
}
