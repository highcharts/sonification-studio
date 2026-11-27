/*
    Data store for global chart parameters.
 */

import { defineStore } from 'pinia';
import { firstDefined } from '../../core/utils/objects';

export interface ChartParametersState {
    type: string;
    legendEnabled: boolean;
    inverted: boolean;
    title: string;
    subtitle: string;
    xAxisTitle: string;
    xAxisType: string;
    xAxisVisible: boolean;
    xAxisMin: string;
    xAxisMax: string;
    yAxisTitle: string;
    yAxisType: string;
    yAxisVisible: boolean;
    yAxisMin: string;
    yAxisMax: string;
    seriesLabelsEnabled: boolean;
    sharedTooltipEnabled: boolean;
    zoomType: string;
    dataGroupingType: string;
}

const defaultState = (): ChartParametersState => ({
    type: 'areaspline',
    legendEnabled: true,
    inverted: false,
    title: 'Test chart',
    subtitle: '',
    xAxisTitle: '',
    xAxisType: 'linear',
    xAxisVisible: true,
    xAxisMin: '',
    xAxisMax: '',
    yAxisTitle: 'Values',
    yAxisType: 'linear',
    yAxisVisible: true,
    yAxisMin: '',
    yAxisMax: '',
    seriesLabelsEnabled: false,
    sharedTooltipEnabled: true,
    zoomType: 'x',
    dataGroupingType: 'default'
});

// Set one state value, keeping the value type of the key when looping over keys.
function setStateValue<K extends keyof ChartParametersState>(
    state: ChartParametersState,
    key: K,
    value: ChartParametersState[K]
): void {
    state[key] = value;
}

export const useChartParametersStore = defineStore('chartParameters', {
    state: defaultState,

    actions: {
        // Apply a new state or restore to default if no new state is supplied.
        restoreStoreState(newState?: Partial<ChartParametersState>) {
            if (newState) {
                (Object.keys(defaultState()) as Array<keyof ChartParametersState>).forEach(
                    key => setStateValue(this.$state, key, firstDefined(newState[key], this.$state[key])));
            } else {
                Object.assign(this.$state, defaultState());
            }
        },

        setType(type: string) {
            this.type = type;
        },

        setLegendEnabled(enabled: boolean) {
            this.legendEnabled = enabled;
        },

        setChartInverted(inverted: boolean) {
            this.inverted = inverted;
        },

        setSharedTooltipEnabled(enabled: boolean) {
            this.sharedTooltipEnabled = enabled;
        },

        setTitle(title: string) {
            this.title = title;
        },

        setSubtitle(subtitle: string) {
            this.subtitle = subtitle;
        },

        setXAxisTitle(title: string) {
            this.xAxisTitle = title;
        },

        setXAxisType(type: string) {
            this.xAxisType = type;
        },

        setXAxisVisible(visible: boolean) {
            this.xAxisVisible = visible;
        },

        setXAxisMin(value: string) {
            this.xAxisMin = value;
        },

        setXAxisMax(value: string) {
            this.xAxisMax = value;
        },

        setYAxisTitle(title: string) {
            this.yAxisTitle = title;
        },

        setYAxisType(type: string) {
            this.yAxisType = type;
        },

        setYAxisVisible(visible: boolean) {
            this.yAxisVisible = visible;
        },

        setYAxisMin(value: string) {
            this.yAxisMin = value;
        },

        setYAxisMax(value: string) {
            this.yAxisMax = value;
        },

        setSeriesLabelsEnabled(enabled: boolean) {
            this.seriesLabelsEnabled = enabled;
        },

        setZoomType(type: string) {
            this.zoomType = type;
        },

        setDataGroupingType(type: string) {
            this.dataGroupingType = type;
        }
    }
});
