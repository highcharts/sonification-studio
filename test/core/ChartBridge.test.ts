import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import type { Chart } from 'highcharts';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import highchartsPackage from 'highcharts/package.json';
import Highcharts from '../../src/app/editor/core/highchartsSetup';
import { ChartBridge, highchartsExportCDN } from '../../src/app/editor/core/ChartBridge';
import { getChartOptionsFromParameters } from '../../src/app/editor/core/optionsMapper/chartOptionsMapper';
import { useChartParametersStore } from '../../src/app/editor/store/modules/chartParameters';
import { useSeriesParametersStore } from '../../src/app/editor/store/modules/seriesParameters';
import { GoogleSheetStatus, tableCSVDelimiter, useDataStore, type TableRow } from '../../src/app/editor/store/modules/data';
import { useGlobalSonifyParametersStore } from '../../src/app/editor/store/modules/globalSonifyParameters';
import { useViewStore } from '../../src/app/editor/store/modules/view';
import { restoreAppState } from '../../src/app/editor/store/store';
import { restoreFromProjectFile } from '../../src/app/editor/core/utils/projectFileHandling';
import type { GenericObject } from '../../src/app/editor/core/utils/objects';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import fixtureContents from '../fixtures/project-v1.1.1.hssp?raw';
import masterLocalStorageJSON from '../fixtures/localstorage-v1.1.1.json?raw';

// The chart options mapping needs a real chart; the store wiring tests below
// give the bridge a stand-in.
vi.mock('../../src/app/editor/core/optionsMapper/chartOptionsMapper', () => ({
    getChartOptionsFromParameters: vi.fn(() => ({}))
}));

afterEach(() => {
    // Remove the bridges' error handlers from the shared Highcharts instance
    Highcharts.removeEvent(Highcharts, 'displayError');
});

// The message the data module reports a failed Google Sheets request with.
// Each test uses its own API message, as Highcharts logs a message only once.
function requestFailed(apiMessage: string): string {
    return 'Request failed - 400 \n' + JSON.stringify({
        error: { code: 400, message: apiMessage, status: 'INVALID_ARGUMENT' }
    });
}

describe('ChartBridge Google Sheets errors', () => {
    // Stand-ins for the editor's chart and another chart on the page. The
    // bridge only compares them with the chart an error is reported for.
    const chart = {} as Chart;
    const otherChart = {} as Chart;
    let warn: MockInstance<typeof console.warn>;

    // Set up a chart bridge for the editor's chart, and return the data store
    // it reports Google Sheets errors to
    function getDataStore(selectedDataSource = 'googlesheets') {
        const pinia = createPinia();
        const dataStore = useDataStore(pinia);
        dataStore.setSelectedDataSource(selectedDataSource);
        new ChartBridge(pinia, Highcharts).init(chart);
        return dataStore;
    }

    // The Google Sheets error the data store holds
    function getSheetError(dataStore: ReturnType<typeof useDataStore>) {
        return {
            message: dataStore.googleSheetErrorMessage,
            status: dataStore.googleSheetStatus
        };
    }
    const noSheetError = { message: '', status: GoogleSheetStatus.Loading };

    beforeEach(() => {
        // Highcharts logs warnings no handler prevents with console.warn
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Shows the error of a failed request from the editor\'s chart', () => {
        const dataStore = getDataStore();
        Highcharts.error(requestFailed('API key not valid.'), false, chart);

        expect(getSheetError(dataStore)).toEqual({
            message: 'API key not valid.',
            status: GoogleSheetStatus.Error
        });
        // Handled, so Highcharts does not log it
        expect(warn).not.toHaveBeenCalled();
    });

    test('Ignores errors from other charts', () => {
        const dataStore = getDataStore();
        Highcharts.error(requestFailed('Other chart.'), false, otherChart);
        Highcharts.error(requestFailed('No chart.'), false);

        expect(getSheetError(dataStore)).toEqual(noSheetError);
        expect(warn).toHaveBeenCalledTimes(2);
    });

    test('Ignores request errors when the data comes from the grid', () => {
        const dataStore = getDataStore('table');
        Highcharts.error(requestFailed('Grid data.'), false, chart);

        expect(getSheetError(dataStore)).toEqual(noSheetError);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    test('Ignores other Highcharts errors from the editor\'s chart', () => {
        const dataStore = getDataStore();
        Highcharts.error('Highcharts warning: not a request error', false, chart);

        expect(getSheetError(dataStore)).toEqual(noSheetError);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

describe('ChartBridge fallback chart options', () => {
    test('Give a chart that takes the data of a later update', () => {
        const bridge = new ChartBridge(createPinia(), Highcharts);
        const container = document.createElement('div');
        document.body.appendChild(container);
        const chart = Highcharts.stockChart(container, bridge.buildFallbackChartOptions());

        expect(chart.series.length).toBe(0);
        chart.update({ data: { csv: 'Index;Value\n1;5\n2;7' } });
        expect(chart.series.map((s) => s.name)).toEqual(['Value']);
        expect(chart.series[0].points.map((p) => p.y)).toEqual([5, 7]);

        chart.destroy();
        container.remove();
    });
});

describe('ChartBridge legend clicks', () => {
    const csv = 'Index;First;Second\n0;1;2\n1;3;4\n2;5;6';
    let container: HTMLElement;
    let chart: Chart;
    let pinia: Pinia;
    let bridge: ChartBridge;

    beforeEach(() => {
        pinia = createPinia();
        bridge = new ChartBridge(pinia, Highcharts);
        container = document.createElement('div');
        document.body.appendChild(container);
        // The legend is enabled by a chart parameter, which this file does
        // not map to options
        const options = bridge.buildChartOptions(csv);
        chart = Highcharts.stockChart(container, {
            ...options,
            legend: { ...options.legend, enabled: true }
        });
        bridge.init(chart);
    });

    afterEach(() => {
        chart.destroy();
        container.remove();
    });

    // What the editor does after a parameter change: update the chart with
    // options built from the parameters
    const updateChart = () => chart.update(bridge.buildChartOptions(csv));

    const seriesVisibleParameter = (index: number) =>
        useSeriesParametersStore(pinia).seriesParameters[`se-hc-series-id-${index}`]
            ?.seriesVisible;

    // A click on the legend item's label. The accessibility module clicks
    // the label for keyboard users too, but can not be run in jsdom here (it
    // creates its MouseEvent with a view jsdom rejects).
    const clickLegendItem = (index: number) => {
        const element = chart.series[index].legendItem?.label?.element;
        expect(element).toBeDefined();
        element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };

    test('Hide and show the series, and keep it so after the next update', () => {
        updateChart();
        expect(chart.series.map((s) => s.visible)).toEqual([true, true]);

        clickLegendItem(1);
        expect(chart.series[1].visible).toBe(false);
        expect(seriesVisibleParameter(1)).toBe(false);
        updateChart();
        expect(chart.series.map((s) => s.visible)).toEqual([true, false]);

        clickLegendItem(1);
        expect(chart.series[1].visible).toBe(true);
        expect(seriesVisibleParameter(1)).toBe(true);
        updateChart();
        expect(chart.series.map((s) => s.visible)).toEqual([true, true]);
        expect(seriesVisibleParameter(0)).toBeUndefined();
    });
});

describe('ChartBridge series of the data\'s columns', () => {
    let container: HTMLElement;
    let chart: Chart | undefined;
    let pinia: Pinia;
    let bridge: ChartBridge;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        bridge = new ChartBridge(pinia, Highcharts);
        container = document.createElement('div');
        document.body.appendChild(container);
        vi.spyOn(window, 'alert').mockImplementation(() => undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        chart?.destroy();
        chart = void 0;
        container.remove();
        vi.restoreAllMocks();
    });

    // Show the data store's data, as the editor does: create the chart, hand
    // it to the bridge, then update it with options that have the series
    // parameters. Later calls update the chart, as a data change does.
    function showData(): Chart {
        const options = bridge.buildChartOptions(useDataStore(pinia).tableCSV);
        if (!chart) {
            chart = Highcharts.stockChart(container, options);
            bridge.init(chart);
        }
        chart.update(bridge.buildChartOptions(useDataStore(pinia).tableCSV), true, true);
        return chart;
    }

    // Load a project file, then load its data from the CSV, as the chart
    // created again after a project is loaded does (Preview.vue)
    function loadProject(fileContents: string) {
        restoreFromProjectFile(fileContents, pinia);
        const data = useDataStore(pinia);
        data.loadFromCSV(data.tableCSV, tableCSVDelimiter);
    }

    // A project file as master v1.1.1 saved it
    const masterProjectFile = (state: object) => compressToUTF16(JSON.stringify({
        ...state, appVersion: '1.1.1', storeVersion: 4
    }));

    // The chart's series and their y values (also of hidden series, which
    // have no points)
    const describeSeries = (shownChart: Chart) => shownChart.series.map((s) => ({
        name: s.name,
        visible: s.visible,
        y: ((s.options as GenericObject).data as unknown[][]).map((point) => point[1])
    }));

    const setSeriesName = (index: number, name: string) =>
        useSeriesParametersStore(pinia).setSeriesParameter({
            seriesId: `se-hc-series-id-${index}`, parameterName: 'seriesName', parameterValue: name
        });

    test('An old project with an empty middle column gives its saved settings to the right data', () => {
        // Master v1.1.1 dropped the empty column B from the CSV each time it
        // loaded it, so the series of column C was its first series. Rows
        // loaded from a CSV leave out their empty cells.
        const fixture = JSON.parse(decompressFromUTF16(fixtureContents));
        loadProject(masterProjectFile({
            ...fixture,
            dataStore: {
                ...fixture.dataStore,
                tableRowData: [{ A: 'Index', C: 'Cos' }, { A: '0', C: '10' }, { A: '1', C: '8' }],
                tableCSV: 'Index;Cos\n0;10\n1;8'
            },
            seriesParametersStore: {
                seriesParameters: {
                    'se-hc-series-id-0': { seriesName: 'Custom C', seriesType: 'line' }
                }
            }
        }));

        // The data keeps its columns (no column shift on load)
        const data = useDataStore(pinia);
        expect(data.tableRowData).toEqual([{ A: 'Index', C: 'Cos' }, { A: '0', C: '10' }, { A: '1', C: '8' }]);
        expect(data.tableCSV).toBe('Index;;Cos\n0;;10\n1;;8');

        // No series for the empty column
        const shownChart = showData();
        expect(describeSeries(shownChart)).toEqual([
            { name: 'Custom C', visible: true, y: [10, 8] }
        ]);
        expect(shownChart.series[0].type).toBe('line');
    });

    test('The v1.1.1 project file and session give the series they gave in v1.1.1', () => {
        const fixture = JSON.parse(decompressFromUTF16(fixtureContents));
        // The first row holds the series names
        const expectedSeries = [{
            name: 'Sensor', visible: true,
            y: fixture.dataStore.tableRowData.slice(1).map((row: TableRow) => row.B)
        }, {
            name: 'Cosine', visible: false,
            y: fixture.dataStore.tableRowData.slice(1).map((row: TableRow) => row.C)
        }];

        loadProject(fixtureContents);
        const shownChart = showData();
        expect(describeSeries(shownChart)).toEqual(expectedSeries);
        expect(shownChart.series[0].type).toBe('line');
        expect(shownChart.series[0].color).toBe('#d9480f');

        chart?.destroy();
        chart = void 0;
        setActivePinia(pinia = createPinia());
        bridge = new ChartBridge(pinia, Highcharts);
        restoreAppState(JSON.parse(masterLocalStorageJSON), pinia);
        // The chart loads the data from the CSV (Preview.vue)
        const data = useDataStore(pinia);
        data.loadFromCSV(data.tableCSV, tableCSVDelimiter);
        expect(describeSeries(showData())).toEqual(expectedSeries);
    });

    test('Data typed into the grid with an empty middle column has no hidden series', () => {
        // The grid writes every column up to the last one in use
        useDataStore(pinia).setTableRowData([
            { A: 'Index', B: '', C: 'Cos' },
            { A: '0', B: '', C: '10' },
            { A: '1', B: '', C: '8' }
        ]);
        setSeriesName(0, 'Custom C');

        expect(describeSeries(showData())).toEqual([
            { name: 'Custom C', visible: true, y: [10, 8] }
        ]);
    });

    test('A column of text only has no series', () => {
        useDataStore(pinia).setTableRowData([
            { A: 'Index', B: 'Label', C: 'Value' },
            { A: '0', B: 'first', C: '10' },
            { A: '1', B: 'second', C: '8' }
        ]);

        expect(describeSeries(showData())).toEqual([
            { name: 'Value', visible: true, y: [10, 8] }
        ]);
    });

    test('A cleared grid gives a chart without series', () => {
        useDataStore(pinia).setTableRowData([{}, {}, {}]);
        expect(describeSeries(showData())).toEqual([]);
    });

    test('A column emptied and filled again gets its settings back', () => {
        const data = useDataStore(pinia);
        const rows = (b: string[]) => [
            { A: 'Index', B: b[0], C: 'Second' },
            { A: '0', B: b[1], C: '10' },
            { A: '1', B: b[2], C: '8' }
        ];
        data.setTableRowData(rows(['First', '1', '2']));
        setSeriesName(0, 'Custom first');
        setSeriesName(1, 'Custom second');
        const parametersBefore = JSON.stringify(useSeriesParametersStore(pinia).seriesParameters);
        expect(describeSeries(showData()).map((s) => [s.name, s.y])).toEqual([
            ['Custom first', [1, 2]], ['Custom second', [10, 8]]
        ]);

        // While column B is empty, column C has the first series, and so
        // the settings of series 0, as after a load in v1.1.1
        data.setTableRowData(rows(['', '', '']));
        expect(describeSeries(showData()).map((s) => [s.name, s.y])).toEqual([
            ['Custom first', [10, 8]]
        ]);

        data.setTableRowData(rows(['First', '1', '2']));
        expect(describeSeries(showData()).map((s) => [s.name, s.y])).toEqual([
            ['Custom first', [1, 2]], ['Custom second', [10, 8]]
        ]);
        expect(JSON.stringify(useSeriesParametersStore(pinia).seriesParameters)).toBe(parametersBefore);
    });

    test('Google Sheets data keeps a hidden series for an empty column', () => {
        const data = useDataStore(pinia);
        data.setSelectedDataSource('googlesheets');
        data.setSpreadsheetSetupComplete(true);
        bridge.init({ options: {}, series: [] });
        const parseResult = {
            series: [
                { name: 'Empty', data: [[0, null], [1, null]] },
                { name: 'Values', data: [[0, 10], [1, 8]] }
            ]
        };

        bridge.buildChartOptions().data.complete(parseResult);

        expect(parseResult.series.map((s: GenericObject) => [s.name, s.visible, s.showInLegend]))
            .toEqual([['Empty', false, false], ['Values', true, true]]);
    });
});

describe('ChartBridge HTML export', () => {
    // Fails when the highcharts dependency moves to another major version:
    // bump highchartsExportCDN with it, see the comment there.
    test('Loads Highcharts from the CDN for the app\'s major version', () => {
        const major = highchartsPackage.version.split('.')[0];
        expect(highchartsExportCDN).toBe(`https://code.highcharts.com/${major}`);
    });
});

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
        chartBridge = new ChartBridge(pinia, Highcharts);
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
