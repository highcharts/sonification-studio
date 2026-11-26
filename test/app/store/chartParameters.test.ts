import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useChartParametersStore } from '../../../src/app/editor/store/modules/chartParameters';

const defaults = {
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
};

describe('chartParameters store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('Starts with the default state, keys in order', () => {
        const store = useChartParametersStore();
        expect(store.$state).toEqual(defaults);
        expect(Object.keys(store.$state)).toEqual(Object.keys(defaults));
    });

    test('Setters set their parameter', () => {
        const store = useChartParametersStore();
        store.setType('line');
        store.setLegendEnabled(false);
        store.setChartInverted(true);
        store.setSharedTooltipEnabled(false);
        store.setTitle('T');
        store.setSubtitle('S');
        store.setXAxisTitle('X');
        store.setXAxisType('datetime');
        store.setXAxisVisible(false);
        store.setXAxisMin('1');
        store.setXAxisMax('2');
        store.setYAxisTitle('Y');
        store.setYAxisType('logarithmic');
        store.setYAxisVisible(false);
        store.setYAxisMin('3');
        store.setYAxisMax('4');
        store.setSeriesLabelsEnabled(true);
        store.setZoomType('xy');
        store.setDataGroupingType('none');
        expect(store.$state).toEqual({
            type: 'line',
            legendEnabled: false,
            inverted: true,
            title: 'T',
            subtitle: 'S',
            xAxisTitle: 'X',
            xAxisType: 'datetime',
            xAxisVisible: false,
            xAxisMin: '1',
            xAxisMax: '2',
            yAxisTitle: 'Y',
            yAxisType: 'logarithmic',
            yAxisVisible: false,
            yAxisMin: '3',
            yAxisMax: '4',
            seriesLabelsEnabled: true,
            sharedTooltipEnabled: false,
            zoomType: 'xy',
            dataGroupingType: 'none'
        });
    });

    describe('restoreStoreState', () => {
        test('Takes defined values from the new state and keeps the current ones otherwise', () => {
            const store = useChartParametersStore();
            store.setTitle('Current title');
            store.setSubtitle('Current subtitle');

            store.restoreStoreState({
                type: 'column',
                title: 'Restored title',
                subtitle: undefined,
                // Falsy but defined values are taken
                legendEnabled: false,
                xAxisMin: ''
            });

            expect(store.$state).toEqual({
                ...defaults,
                type: 'column',
                title: 'Restored title',
                subtitle: 'Current subtitle',
                legendEnabled: false
            });
        });

        test('Ignores keys that are not chart parameters', () => {
            const store = useChartParametersStore();
            const newState = { title: 'A', unknownKey: 1 };
            store.restoreStoreState(newState);
            expect(store.$state).toEqual({ ...defaults, title: 'A' });
        });

        test('Resets to the defaults without a new state', () => {
            const store = useChartParametersStore();
            store.setType('line');
            store.setTitle('T');
            store.setYAxisVisible(false);
            store.restoreStoreState();
            expect(store.$state).toEqual(defaults);
        });
    });
});
