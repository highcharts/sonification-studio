import { Store } from 'vuex';

/*
    Interface between chart-specific logic and the rest of the
    app.
 */
export class ChartBridge {
    private chart: any = null;
    private sonifyParametersStore: any;

    constructor(store: Store<any>) {
        this.sonifyParametersStore = store.state.sonifyParametersStore;
    }

    /**
     * Init the class with a chart and Vuex store instance.
     */
    public init(chart: any) {
        this.chart = chart;
    }

    public playChart() {
        console.log('Play chart', this.sonifyParametersStore.volume);
    }

    public stopChart() {
        console.log('Stop chart');
    }

    public pauseChart() {
        console.log('Pause chart');
    }

    public holdChart() {
        console.log('Hold chart');
    }

    public loopChart() {
        console.log('Loop chart');
    }
}
