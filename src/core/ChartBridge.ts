/*
    Interface between chart-specific logic and the rest of the
    app.
 */
export class ChartBridge {
    private chart: any = null;

    /**
     * Init the class with a chart instance.
     *
     * @param chart Highcharts.Chart instance.
     */
    public init(chart: any) {
        this.chart = chart;
    }

    public playChart() {
        console.log('Play chart');
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
