/*
    Data store for global chart parameters.
 */

export const chartParametersStore = {
    namespaced: true,

    state: {
        type: 'spline',
        legendEnabled: false,
        title: 'Test chart',
        subtitle: '',
        xAxisTitle: '',
        yAxisTitle: 'Values',
        seriesLabelsEnabled: false
    },

    mutations: {
        setType(state: any, type: string) {
            state.type = type;
        },

        setLegendEnabled(state: any, enabled: boolean) {
            state.legendEnabled = enabled;
        },

        setTitle(state: any, title: string) {
            state.title = title;
        },

        setSubtitle(state: any, subtitle: string) {
            state.subtitle = subtitle;
        },

        setXAxisTitle(state: any, title: string) {
            state.xAxisTitle = title;
        },

        setYAxisTitle(state: any, title: string) {
            state.yAxisTitle = title;
        },

        setSeriesLabelsEnabled(state: any, enabled: boolean) {
            state.seriesLabelsEnabled = enabled;
        }
    }
};
