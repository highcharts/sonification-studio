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
import { applyCellEdit } from '../../src/app/editor/core/utils/gridData';
import { escapeHTML } from '../../src/app/editor/core/utils/htmlText';
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
        // The data store's CSV, as the editor charts it
        useDataStore(pinia).loadFromCSV(csv, tableCSVDelimiter);
        expect(useDataStore(pinia).tableCSV).toBe(csv);
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

    // Load a project file. The chart created again after a project is
    // loaded (Preview.vue) leaves the rows as they are.
    function loadProject(fileContents: string) {
        restoreFromProjectFile(fileContents, pinia);
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

    test('An old project with an empty middle column gives its saved settings to the right data', () => {
        // Master v1.1.1 left the empty column B out of the chart after it
        // loaded the project, so the series of column C was its first series
        // and has the settings of series 0. Rows loaded from a CSV have no
        // cells for empty values.
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
        expect(describeSeries(showData())).toEqual(expectedSeries);
    });

    // Set series settings as the series settings panel does
    const setSeriesSettings = (index: number, name: string, color: string, instrument: string) => {
        const seriesParameters = useSeriesParametersStore(pinia);
        const seriesId = `se-hc-series-id-${index}`;
        seriesParameters.setSeriesParameter({ seriesId, parameterName: 'seriesName', parameterValue: name });
        seriesParameters.setSeriesParameter({ seriesId, parameterName: 'seriesColor', parameterValue: color });
        seriesParameters.setSeriesParameter({
            seriesId, parameterName: 'instrument', parameterValue: instrument, nestedUnderParent: 'instrument'
        });
    };

    // Name, color and instrument of each series, and whether it is shown
    const describeSettings = (shownChart: Chart) => shownChart.series.map((s) => [
        s.name,
        s.color,
        (s.options as GenericObject).sonification?.tracks?.[0]?.instrument,
        s.visible
    ]);

    test('A column emptied in the grid keeps its hidden series, and the later series their settings', () => {
        const data = useDataStore(pinia);
        data.loadFromCSV([
            'X,First,Second', '0,1,10', '1,2,8', '2,3,6', '3,4,4', '4,5,2', '5,6,0', '6,7,-2'
        ].join('\n'));
        setSeriesSettings(0, 'Custom B', '#ff0000', 'flute');
        setSeriesSettings(1, 'Custom C', '#00ff00', 'piano');
        const parametersBefore = JSON.stringify(useSeriesParametersStore(pinia).seriesParameters);
        const valuesOfC = [10, 8, 6, 4, 2, 0, -2];
        expect(describeSettings(showData())).toEqual([
            ['Custom B', '#ff0000', 'flute', true], ['Custom C', '#00ff00', 'piano', true]
        ]);

        // Clear each cell of column B, as the grid writes its edits
        // (Grid.vue): only the edited cell changes
        const editColumnB = (value: (rowIndex: number) => string) => {
            for (let rowIndex = 1; rowIndex < data.tableRowData.length; rowIndex++) {
                data.setTableRowData(applyCellEdit(data.tableRowData, {
                    rowIndex, columnId: 'B', value: value(rowIndex)
                }));
            }
        };
        editColumnB(() => '');
        let shownChart = showData();
        expect(describeSettings(shownChart)).toEqual([
            ['Custom B', '#ff0000', 'flute', false], ['Custom C', '#00ff00', 'piano', true]
        ]);
        expect(describeSeries(shownChart)[1].y).toEqual(valuesOfC);
        // Not in the legend, as in master v1.1.1
        expect(shownChart.series[0].options.showInLegend).toBe(false);

        editColumnB((rowIndex) => '' + rowIndex);
        shownChart = showData();
        expect(describeSettings(shownChart)).toEqual([
            ['Custom B', '#ff0000', 'flute', true], ['Custom C', '#00ff00', 'piano', true]
        ]);
        expect(describeSeries(shownChart).map((series) => series.y)).toEqual([
            [1, 2, 3, 4, 5, 6, 7], valuesOfC
        ]);
        expect(JSON.stringify(useSeriesParametersStore(pinia).seriesParameters)).toBe(parametersBefore);
    });

    test('Settings made while editing keep their columns after a save and reload, and a later edit', async () => {
        // Rows edited in the grid, with an empty middle column, C: every row
        // has a cell in it, as in the placeholder data
        const data = useDataStore(pinia);
        data.setTableRowData([
            { A: 'X', B: 'First', C: '', D: 'Third' },
            { A: '0', B: '1', C: '', D: '10' },
            { A: '1', B: '2', C: '', D: '8' }
        ]);
        setSeriesSettings(0, 'Custom B', '#ff0000', 'flute');
        setSeriesSettings(2, 'Custom D', '#0000ff', 'piano');
        const expected = [
            ['Custom B', '#ff0000', 'flute', true],
            // The empty column's hidden series
            ['Series 2', expect.any(String), undefined, false],
            ['Custom D', '#0000ff', 'piano', true]
        ];
        expect(describeSettings(showData())).toEqual(expected);

        // Saved and loaded into a new editor, whose chart leaves the rows
        // as they are
        let contents = '';
        window.URL.createObjectURL = (blob: Blob | MediaSource) => {
            contents = '' + (blob as Blob).size;
            void (blob as Blob).text().then((text) => {
                contents = text;
            });
            return 'blob:project';
        };
        const { downloadProjectFile } = await import('../../src/app/editor/core/utils/projectFileHandling');
        downloadProjectFile('Project', pinia);
        await vi.waitFor(() => expect(contents.length).toBeGreaterThan(10));
        chart?.destroy();
        chart = void 0;
        setActivePinia(pinia = createPinia());
        bridge = new ChartBridge(pinia, Highcharts);
        loadProject(contents);
        expect(describeSettings(showData())).toEqual(expected);

        // The first edit in the grid changes only its cell
        const loaded = useDataStore(pinia);
        loaded.setTableRowData(applyCellEdit(loaded.tableRowData, { rowIndex: 1, columnId: 'B', value: '5' }));
        expect(describeSettings(showData())).toEqual(expected);
    });

    test('A grid edit in rows loaded from a CSV gives no column without cells a series', () => {
        // No row has a cell in column B, which has no series
        const data = useDataStore(pinia);
        data.loadFromCSV('Index,,Cos,Sin\n0,,10,1\n1,,8,2');
        setSeriesSettings(1, 'Custom D', '#0000ff', 'piano');
        expect(describeSettings(showData())[1]).toEqual(['Custom D', '#0000ff', 'piano', true]);

        data.setTableRowData(applyCellEdit(data.tableRowData, { rowIndex: 1, columnId: 'C', value: '9' }));

        const settings = describeSettings(showData());
        expect(settings).toHaveLength(2);
        expect(settings[1]).toEqual(['Custom D', '#0000ff', 'piano', true]);
    });

    test('Series and point names are given to the chart escaped, which shows them as text', () => {
        const data = useDataStore(pinia);
        data.loadFromCSV('Label;<b>Temp</b> & co;"x<10"\n<i>Jan</i>;1;2\nFeb;3;4', ';');
        useSeriesParametersStore(pinia).setSeriesParameter({
            seriesId: 'se-hc-series-id-1', parameterName: 'seriesName', parameterValue: '<u>Set</u>'
        });

        const shownChart = showData();
        expect(shownChart.series.map((s) => s.name)).toEqual([
            '&lt;b&gt;Temp&lt;/b&gt; &amp; co',
            '&lt;u&gt;Set&lt;/u&gt;'
        ]);
        expect(shownChart.series[0].points.map((point) => point.name)).toEqual(['&lt;i&gt;Jan&lt;/i&gt;', 'Feb']);
        // Shown as text in the legend
        shownChart.update({ legend: { enabled: true } });
        const legendTexts = Array.from(container.querySelectorAll('.highcharts-legend-item text'))
            .map((text) => text.textContent);
        expect(legendTexts).toEqual(['<b>Temp</b> & co', '<u>Set</u>']);
        expect(container.querySelector('.highcharts-legend-item b, .highcharts-legend-item u')).toBeNull();
    });

    test('A CSV imported with an empty middle column gives the settings of series 0 to its next column', () => {
        // Rows loaded from a CSV have no cells for empty values, so no row
        // has a cell in column B, which master v1.1.1 left out of the chart
        useDataStore(pinia).loadFromCSV('Index,,Cos\n0,,10\n1,,8');
        setSeriesSettings(0, 'Custom C', '#00ff00', 'piano');

        const shownChart = showData();
        expect(describeSettings(shownChart)).toEqual([['Custom C', '#00ff00', 'piano', true]]);
        expect(describeSeries(shownChart)[0].y).toEqual([10, 8]);
    });

    test('Columns of text only or a header only do not throw', () => {
        const data = useDataStore(pinia);
        // A column of text keeps its series (hidden, it has no values to
        // plot), as master v1.1.1 numbered the series
        data.loadFromCSV('Index,Label,Value\n0,first,10\n1,second,8');
        expect(describeSeries(showData())).toEqual([
            { name: 'Label', visible: false, y: [null, null] },
            { name: 'Value', visible: true, y: [10, 8] }
        ]);

        // No row after the first has a cell in a column of a header only,
        // which master v1.1.1 left out
        data.loadFromCSV('Index,Header only,Value\n0,,10\n1,,8');
        expect(describeSeries(showData())).toEqual([
            { name: 'Value', visible: true, y: [10, 8] }
        ]);

        // And header rows only
        data.loadFromCSV('Index,Label,Value');
        expect(describeSeries(showData())).toEqual([]);
    });

    test('A cleared grid gives a chart without series', () => {
        useDataStore(pinia).setTableRowData([{}, {}, {}]);
        expect(describeSeries(showData())).toEqual([]);
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
        // jsDelivr serves the files without a Referer, which a file opened
        // from disk does not send
        expect(highchartsExportCDN).toBe(`https://cdn.jsdelivr.net/npm/highcharts@${major}`);
    });

    test('Keeps text in the options from ending the script element', () => {
        const name = '</script><script>window.x=1</script>';
        const pinia = createPinia();
        const bridge = new ChartBridge(pinia, Highcharts);
        const csv = 'Index;Value\n0;1\n1;2';
        useDataStore(pinia).loadFromCSV(csv, tableCSVDelimiter);
        useSeriesParametersStore(pinia).setSeriesParameter({
            seriesId: 'se-hc-series-id-0', parameterName: 'seriesName', parameterValue: name
        });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const chart = Highcharts.stockChart(container, bridge.buildChartOptions(csv));
        bridge.init(chart);
        chart.update(bridge.buildChartOptions(csv));
        // Text the bridge does not escape for the chart
        chart.update({ title: { text: name } });

        const html = bridge.getHTMLChartConfig();
        chart.destroy();
        container.remove();

        // The page's own script element is the last one, and holds the options
        const optionsStart = html.indexOf('const options = ');
        const scriptStart = html.lastIndexOf('<script>', optionsStart);
        expect(scriptStart).toBeGreaterThan(-1);
        expect(html.indexOf('</script>', scriptStart)).toBe(html.lastIndexOf('</script>'));
        expect(html).toContain('\\u003c/script>');

        // The options hold the title as it is, and the series name escaped,
        // which the exported chart shows as text
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const scripts = doc.querySelectorAll('script');
        expect(scripts).toHaveLength(5);
        // The options are written as JSON, which ends with a "}" line
        const optionsJSON = /const options = ([\s\S]*?\n\});\n/.exec(scripts[4].textContent || '')?.[1];
        const options = JSON.parse(optionsJSON || 'null');
        expect(options.title.text).toBe(name);
        expect(options.series[0].name).toBe(escapeHTML(name));
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

describe('ChartBridge playback when Highcharts rebuilds the timeline', () => {
    // A stand-in for the chart's sonification timeline, playing or paused
    // at a time
    const makeTimeline = (state: { playing?: boolean; paused?: boolean; time?: number } = {}) => {
        const timeline = {
            isPlaying: !!state.playing,
            isPaused: !!state.paused,
            resumeFromTime: state.paused ? state.time ?? 0 : 0,
            channels: ['channel'],
            playingChannels: void 0 as unknown[] | undefined,
            onEndArgument: void 0 as ((e: unknown) => void) | undefined,
            getCurrentTime: () => state.time ?? 0,
            resume: vi.fn(() => {
                timeline.isPlaying = true;
                timeline.isPaused = false;
            }),
            reset: vi.fn(() => {
                timeline.isPlaying = false;
                timeline.isPaused = false;
            })
        };
        return timeline;
    };
    type Timeline = ReturnType<typeof makeTimeline>;

    let bridge: ChartBridge;
    let chart: GenericObject;
    let events: GenericObject;

    beforeEach(() => {
        const pinia = createPinia();
        bridge = new ChartBridge(pinia, Highcharts);
        chart = {
            series: [{}],
            options: { sonification: { duration: 1000 } },
            sonification: {
                timeline: makeTimeline(),
                isPlaying: () => chart.sonification.timeline.isPlaying
            },
            toggleSonify: vi.fn(),
            sonify: vi.fn()
        };
        bridge.init(chart);
        events = bridge.buildChartOptions('x;y\n0;1').sonification.events;
    });

    afterEach(() => {
        bridge.stopChart();
    });

    // What Highcharts does on a render: an update of the timeline
    const rebuildTimeline = (newTimeline: Timeline) => {
        events.beforeUpdate({ chart, timeline: chart.sonification.timeline });
        chart.sonification.timeline = newTimeline;
        events.afterUpdate({ chart, timeline: newTimeline });
        return newTimeline;
    };

    test('Plays on from where it was on the new timeline', () => {
        const onEnd = vi.fn();
        bridge.playChart(onEnd);
        const playEnd = chart.toggleSonify.mock.calls[0][1];
        chart.sonification.timeline = makeTimeline({ playing: true, time: 1200 });

        const timeline = rebuildTimeline(makeTimeline());

        expect(timeline.resumeFromTime).toBe(1200);
        expect(timeline.playingChannels).toBe(timeline.channels);
        expect(timeline.resume).toHaveBeenCalledOnce();
        expect(timeline.isPlaying).toBe(true);
        // The end of playback on the new timeline ends it as before
        expect(timeline.onEndArgument).toBe(playEnd);
    });

    test('Stays paused where it was', () => {
        chart.sonification.timeline = makeTimeline({ paused: true, time: 800 });

        const timeline = rebuildTimeline(makeTimeline());

        expect(timeline.isPaused).toBe(true);
        expect(timeline.resumeFromTime).toBe(800);
        expect(timeline.resume).not.toHaveBeenCalled();
    });

    test('Leaves a stopped timeline alone', () => {
        const timeline = rebuildTimeline(makeTimeline());

        expect(timeline.isPaused).toBe(false);
        expect(timeline.resumeFromTime).toBe(0);
        expect(timeline.resume).not.toHaveBeenCalled();
    });

    test('Resumes a paused timeline with the end callback of the playback resumed', () => {
        // Paused (e.g. stepped through with the keyboard) with the callback
        // of an earlier playback
        const earlier = vi.fn();
        chart.sonification.timeline = makeTimeline({ paused: true, time: 500 });
        chart.sonification.timeline.onEndArgument = earlier;

        bridge.playChart(vi.fn());

        const playEnd = chart.toggleSonify.mock.calls[0][1];
        expect(chart.sonification.timeline.onEndArgument).toBe(playEnd);
    });

    test('Stops playback before an audio export, and tells the play controls', async () => {
        const stopped = vi.fn();
        bridge.onPlaybackStopped(stopped);
        vi.stubGlobal('MediaRecorder', class {
            static isTypeSupported() {
                return true;
            }
            mimeType = 'audio/webm';
            start() {}
            stop() {}
        });
        chart.sonification.audioContext = {
            destination: {},
            createMediaStreamDestination: () => ({ stream: {} })
        };
        chart.sonification.setAudioDestination = vi.fn(() => {
            // Highcharts rebuilds the timeline when the destination changes
            rebuildTimeline(makeTimeline());
        });
        chart.sonification.timeline = makeTimeline({ paused: true, time: 700 });
        const paused = chart.sonification.timeline;

        void bridge.downloadAudio();

        expect(paused.reset).toHaveBeenCalledOnce();
        expect(stopped).toHaveBeenCalledOnce();
        // The export's timeline starts from the beginning
        expect(chart.sonification.timeline.isPaused).toBe(false);
        expect(chart.sonification.timeline.resumeFromTime).toBe(0);
        vi.unstubAllGlobals();
    });

    test('Loops with the same end callback, and stops without loop', () => {
        const onEnd = vi.fn();
        bridge.playChart(onEnd, true);
        const playEnd = chart.toggleSonify.mock.calls[0][1];

        playEnd({});
        playEnd({});
        expect(onEnd).toHaveBeenCalledTimes(2);
        // Each round plays the chart again, with the callback that loops
        expect(chart.sonify.mock.calls).toEqual([[playEnd], [playEnd]]);
        expect(chart.sonification.timeline.reset).not.toHaveBeenCalled();

        chart.toggleSonify.mockClear();
        bridge.playChart(onEnd);
        chart.toggleSonify.mock.calls[0][1]({});
        expect(chart.sonify).toHaveBeenCalledTimes(2);
        expect(chart.sonification.timeline.reset).toHaveBeenCalledOnce();
    });
});

describe('ChartBridge Google Sheets polling', () => {
    test('A poll with unchanged data is no news, a changed one is', () => {
        const pinia = createPinia();
        const data = useDataStore(pinia);
        data.restoreStoreState({
            tableRowData: [],
            selectedDataSource: 'googlesheets',
            spreadsheetSetupComplete: true,
            googleSpreadsheetURL: 'https://docs.google.com/spreadsheets/d/abc/edit',
            googleApiKey: 'key'
        });
        const bridge = new ChartBridge(pinia, Highcharts);
        const statusActions: string[] = [];
        data.$onAction(({ name }) => {
            if (name === 'setGoogleSheetStatus') {
                statusActions.push(name);
            }
        });
        // What the data module parses from the sheet on each poll
        const poll = (y: number) => bridge.buildChartOptions().data.complete({
            series: [{ name: 'Sheet', data: [[0, 1], [1, y]] }]
        });

        poll(2);
        poll(2);
        expect(statusActions).toHaveLength(1);
        expect(data.googleSheetStatus).toBe(GoogleSheetStatus.Success);

        poll(3);
        expect(statusActions).toHaveLength(2);
    });
});
