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
}
