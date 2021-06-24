/*
    Data store for global chart parameters.
 */

import { GenericObject, firstDefined } from '../../core/utils/objects';

const defaultState = () => ({
    type: 'spline',
    legendEnabled: false,
    inverted: false,
    title: 'Test chart',
    subtitle: '',
    xAxisTitle: '',
    xAxisType: 'linear',
    yAxisTitle: 'Values',
    yAxisType: 'linear',
    seriesLabelsEnabled: false
});

export const chartParametersStore = {
    namespaced: true,

    state: defaultState(),

    mutations: {
        // Apply a new state or restore to default if no new state is supplied.
        restoreStoreState(state: any, newState?: GenericObject) {
            if (newState) {
                Object.keys(defaultState()).forEach(
                    key => state[key] = firstDefined(newState[key], state[key]));
            } else {
                Object.assign(state, defaultState());
            }
        },

        setType(state: any, type: string) {
            state.type = type;
        },

        setLegendEnabled(state: any, enabled: boolean) {
            state.legendEnabled = enabled;
        },

        setChartInverted(state: any, inverted: boolean) {
            state.inverted = inverted;
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

        setXAxisType(state: any, type: string) {
            state.xAxisType = type;
        },

        setYAxisTitle(state: any, title: string) {
            state.yAxisTitle = title;
        },

        setYAxisType(state: any, type: string) {
            state.yAxisType = type;
        },

        setSeriesLabelsEnabled(state: any, enabled: boolean) {
            state.seriesLabelsEnabled = enabled;
        }
    }
};
