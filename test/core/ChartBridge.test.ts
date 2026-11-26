import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import type { Chart } from 'highcharts';
import type { Store } from 'vuex';
import highchartsPackage from 'highcharts/package.json';
import Highcharts from '../../src/app/editor/core/highchartsSetup';
import { ChartBridge, highchartsExportCDN } from '../../src/app/editor/core/ChartBridge';
import { GoogleSheetStatus } from '../../src/app/editor/store/modules/data';

// What the chart bridge reads from and writes to the Vuex store
function getStubStore(selectedDataSource: string) {
    return {
        state: {
            chartParametersStore: {},
            seriesParametersStore: {},
            globalSonifyParametersStore: {},
            dataStore: { selectedDataSource }
        },
        getters: {},
        commit: vi.fn(),
        subscribe: vi.fn()
    };
}

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

    function getBridge(selectedDataSource = 'googlesheets') {
        const store = getStubStore(selectedDataSource);
        new ChartBridge(store as unknown as Store<any>, Highcharts).init(chart);
        // Leave out what init() commits
        store.commit.mockClear();
        return store;
    }

    beforeEach(() => {
        // Highcharts logs warnings no handler prevents with console.warn
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        // Remove the bridges' handlers from the shared Highcharts instance
        Highcharts.removeEvent(Highcharts, 'displayError');
        vi.restoreAllMocks();
    });

    test('Shows the error of a failed request from the editor\'s chart', () => {
        const store = getBridge();
        Highcharts.error(requestFailed('API key not valid.'), false, chart);

        expect(store.commit.mock.calls).toEqual([
            ['dataStore/setGoogleSheetErrorMessage', 'API key not valid.'],
            ['dataStore/setGoogleSheetStatus', GoogleSheetStatus.Error]
        ]);
        // Handled, so Highcharts does not log it
        expect(warn).not.toHaveBeenCalled();
    });

    test('Ignores errors from other charts', () => {
        const store = getBridge();
        Highcharts.error(requestFailed('Other chart.'), false, otherChart);
        Highcharts.error(requestFailed('No chart.'), false);

        expect(store.commit).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(2);
    });

    test('Ignores request errors when the data comes from the grid', () => {
        const store = getBridge('table');
        Highcharts.error(requestFailed('Grid data.'), false, chart);

        expect(store.commit).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(1);
    });

    test('Ignores other Highcharts errors from the editor\'s chart', () => {
        const store = getBridge();
        Highcharts.error('Highcharts warning: not a request error', false, chart);

        expect(store.commit).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

describe('ChartBridge fallback chart options', () => {
    test('Give a chart that takes the data of a later update', () => {
        const bridge = new ChartBridge(
            getStubStore('table') as unknown as Store<any>, Highcharts
        );
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

describe('ChartBridge HTML export', () => {
    // Fails when the highcharts dependency moves to another major version:
    // bump highchartsExportCDN with it, see the comment there.
    test('Loads Highcharts from the CDN for the app\'s major version', () => {
        const major = highchartsPackage.version.split('.')[0];
        expect(highchartsExportCDN).toBe(`https://code.highcharts.com/${major}`);
    });
});
