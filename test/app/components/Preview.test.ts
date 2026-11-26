import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createStore } from 'vuex';
import type { Options } from 'highcharts';
import Highcharts from '../../../src/app/editor/core/highchartsSetup';
import Preview from '../../../src/app/editor/components/Preview.vue';

// Options Highcharts throws on, when it creates the chart or updates it
const unrenderable: Options = { series: [{ type: 'nonexistent' as 'line', data: [1, 2] }] };
const renderable: Options = { series: [{ type: 'line', data: [1, 2] }] };

function mountPreview(chartOptions: Options, fallbackOptions: Options) {
    const store = createStore({
        modules: {
            dataStore: {
                namespaced: true,
                state: { tableCSV: '' },
                actions: { loadFromCSV: () => undefined }
            },
            viewStore: {
                namespaced: true,
                state: { reactToParameterUpdates: 0, loadingChart: false }
            }
        }
    });
    const chartBridge = {
        reactiveGet: () => chartOptions,
        buildFallbackChartOptions: () => fallbackOptions,
        init: vi.fn(),
        stopChart: vi.fn()
    };
    const announcer = { announce: vi.fn() };
    const wrapper = mount(Preview, {
        attachTo: document.body,
        global: {
            plugins: [store],
            mocks: { $chartBridge: chartBridge, $announcer: announcer }
        }
    });
    return { wrapper, chartBridge, announcer };
}

describe('Preview.vue', () => {
    let wrapper: VueWrapper | undefined;
    let consoleError: MockInstance<typeof console.error>;

    beforeEach(() => {
        consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        vi.restoreAllMocks();
    });

    test('Hands the chart it created to the chart bridge', async () => {
        const preview = mountPreview(renderable, {});
        wrapper = preview.wrapper;
        await flushPromises();

        expect(preview.chartBridge.init).toHaveBeenCalledTimes(1);
        expect(preview.chartBridge.init.mock.calls[0][0].series[0].type).toBe('line');
        expect(preview.announcer.announce).not.toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();
    });

    test('Creates the chart from fallback options when Highcharts throws', async () => {
        const preview = mountPreview(unrenderable, {});
        wrapper = preview.wrapper;
        await flushPromises();

        // The fallback chart, which the editor's options then fail to update
        const chart = preview.chartBridge.init.mock.calls[0]?.[0];
        expect(chart).toBeDefined();
        expect(Highcharts.charts.filter((c) => c)).toEqual([chart]);
        expect(consoleError.mock.calls.map((call) => call[0])).toEqual([
            'Could not create the chart:',
            'Could not update the chart:'
        ]);
        expect(preview.announcer.announce.mock.calls).toEqual([
            ['The chart could not be updated.']
        ]);
    });

    test('Announces when not even the fallback options give a chart', async () => {
        const preview = mountPreview(unrenderable, unrenderable);
        wrapper = preview.wrapper;
        await flushPromises();

        expect(preview.chartBridge.init).not.toHaveBeenCalled();
        expect(Highcharts.charts.filter((c) => c)).toEqual([]);
        expect(preview.announcer.announce.mock.calls).toEqual([
            ['The chart could not be created.']
        ]);
    });
});
