import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { ChartBridge } from '../../src/app/editor/core/ChartBridge';
import { getChartOptionsFromParameters } from '../../src/app/editor/core/optionsMapper/chartOptionsMapper';
import { useChartParametersStore } from '../../src/app/editor/store/modules/chartParameters';
import { useSeriesParametersStore } from '../../src/app/editor/store/modules/seriesParameters';
import { useDataStore } from '../../src/app/editor/store/modules/data';
import { useGlobalSonifyParametersStore } from '../../src/app/editor/store/modules/globalSonifyParameters';
import { useViewStore } from '../../src/app/editor/store/modules/view';

// The chart options mapping needs a real chart; this file tests the store wiring.
vi.mock('../../src/app/editor/core/optionsMapper/chartOptionsMapper', () => ({
    getChartOptionsFromParameters: vi.fn(() => ({}))
}));

describe('ChartBridge store wiring', () => {
    let pinia: Pinia;
    let chartBridge: ChartBridge;

    // The view store's reactivity counters
    const counters = () => {
        const view = useViewStore(pinia);
        return { param: view.reactToParameterUpdates, data: view.reactToDataUpdates };
    };

    // Give the chart bridge a chart, which also triggers both counters once
    const initChart = () => {
        chartBridge.init({ options: {} });
        expect(counters()).toEqual({ param: 1, data: 1 });
        vi.mocked(getChartOptionsFromParameters).mockClear();
    };

    beforeEach(() => {
        vi.useFakeTimers();
        pinia = createPinia();
        setActivePinia(pinia);
        chartBridge = new ChartBridge(pinia, {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.mocked(getChartOptionsFromParameters).mockClear();
    });

    test('Queues nothing before there is a chart', () => {
        useChartParametersStore(pinia).setTitle('Title');
        useDataStore(pinia).setTextDescription('Description');
        vi.advanceTimersByTime(5000);
        expect(counters()).toEqual({ param: 0, data: 0 });
    });

    test('Maps chart options from the parameter stores\' state', () => {
        initChart();
        chartBridge.forceUpdate();
        expect(getChartOptionsFromParameters).toHaveBeenCalledWith(
            useGlobalSonifyParametersStore(pinia).$state,
            useChartParametersStore(pinia).$state,
            { options: {} }
        );
    });

    test('Parameter store actions queue parameter reactivity, once per 300 ms', () => {
        initChart();

        useChartParametersStore(pinia).setTitle('Title');
        useSeriesParametersStore(pinia).setSeriesParameter({
            seriesId: 's', parameterName: 'seriesName', parameterValue: 'Series'
        });
        vi.advanceTimersByTime(299);
        expect(counters()).toEqual({ param: 1, data: 1 });

        vi.advanceTimersByTime(1);
        expect(counters()).toEqual({ param: 2, data: 1 });
        // The chart options are updated before the counter
        expect(getChartOptionsFromParameters).toHaveBeenCalledOnce();

        useGlobalSonifyParametersStore(pinia).setVolume(50);
        vi.advanceTimersByTime(300);
        expect(counters()).toEqual({ param: 3, data: 1 });
    });

    test('Data store actions queue data reactivity, once per second', () => {
        initChart();

        const data = useDataStore(pinia);
        data.setSelectedDataSource('table');
        // Nested action call: loadFromCSV calls setTableRowData
        data.loadFromCSV('a,b\n1,2');
        vi.advanceTimersByTime(999);
        expect(counters()).toEqual({ param: 1, data: 1 });

        vi.advanceTimersByTime(1);
        expect(counters()).toEqual({ param: 1, data: 2 });
        expect(getChartOptionsFromParameters).not.toHaveBeenCalled();
    });

    test('Queues after the action ran, and not for failed actions', () => {
        initChart();
        const data = useDataStore(pinia);
        data.setTableRowData([{ A: 'x' }, { A: '1' }]);
        vi.advanceTimersByTime(1000);
        expect(counters().data).toBe(2);

        expect(() => data.fillColumn({ columnName: 'B', equation: '2 *' })).toThrow();
        vi.advanceTimersByTime(1000);
        expect(counters().data).toBe(2);
    });

    test('Editing the text description queues no data reactivity', () => {
        initChart();
        useDataStore(pinia).setTextDescription('Description');
        vi.advanceTimersByTime(5000);
        expect(counters()).toEqual({ param: 1, data: 1 });
    });

    test('View store actions queue nothing', () => {
        initChart();
        useViewStore(pinia).selectSidebarTab('Audio');
        vi.advanceTimersByTime(5000);
        expect(counters()).toEqual({ param: 1, data: 1 });
    });

    test('Polls Google Sheets at the auto-update frequency', () => {
        const data = useDataStore(pinia);
        data.setSelectedDataSource('googlesheets');
        data.setSpreadsheetSetupComplete(true);
        data.setGoogleApiKey('key');
        data.setGoogleSpreadsheetURL('https://docs.google.com/spreadsheets/d/sheet-id/edit');
        data.setGoogleAutoUpdateEnabled(true);

        const dataOptions = chartBridge.buildChartOptions().data;

        expect(dataOptions).toMatchObject({
            googleAPIKey: 'key',
            googleSpreadsheetKey: 'sheet-id',
            enablePolling: true,
            dataRefreshRate: 10
        });
    });
});
