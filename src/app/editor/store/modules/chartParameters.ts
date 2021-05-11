/*
    Data store for global chart parameters.
 */

import { GenericObject, firstDefined } from '../../core/utils/objects';

const defaultState = () => ({
    type: 'spline',
    legendEnabled: false,
    title: 'Test chart',
    subtitle: '',
    xAxisTitle: '',
    yAxisTitle: 'Values',
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
