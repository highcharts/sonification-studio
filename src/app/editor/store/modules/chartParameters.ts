/*
    Data store for global chart parameters.
 */

import { GenericObject } from '../../core/utils/objects';

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
        // Add items here if they are to be restored from opening project files
        // or localStorage session restore.
        restoreStoreState(state: any, newState: GenericObject) {
            ['type', 'legendEnabled', 'title', 'subtitle', 'xAxisTitle', 'yAxisTitle', 'seriesLabelsEnabled'].forEach(
                x => state[x] = newState[x]);
        },

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
