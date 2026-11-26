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
    const loadFromCSV = vi.fn();
    const store = createStore({
        modules: {
            dataStore: {
                namespaced: true,
                state: { tableCSV: '' },
                actions: { loadFromCSV }
            },
            viewStore: {
                namespaced: true,
                state: { reactToParameterUpdates: 0, loadingChart: false },
                mutations: {
                    triggerParameterReactivity(state: { reactToParameterUpdates: number }) {
                        state.reactToParameterUpdates++;
                    }
                }
            }
        }
    });
    const preview = {
        chartOptions,
        store,
        loadFromCSV,
        chartBridge: {
            // A new object each time, as the chart bridge returns
            reactiveGet: () => ({ ...preview.chartOptions }),
            buildFallbackChartOptions: () => fallbackOptions,
            init: vi.fn(),
            forceUpdate: vi.fn(),
            stopChart: vi.fn()
        },
        announcer: { announce: vi.fn() },
        wrapper: undefined as VueWrapper | undefined
    };
    preview.wrapper = mount(Preview, {
        attachTo: document.body,
        global: {
            plugins: [store],
            mocks: { $chartBridge: preview.chartBridge, $announcer: preview.announcer }
        }
    });
    return preview;
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
        expect(preview.chartBridge.forceUpdate).not.toHaveBeenCalled();
        expect(preview.loadFromCSV).toHaveBeenCalledTimes(1);
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
            ['The chart could not be shown with the current settings.']
        ]);
        // Options derived from the fallback chart are refreshed
        expect(preview.chartBridge.forceUpdate).toHaveBeenCalledWith(true);
        expect(preview.loadFromCSV).toHaveBeenCalledTimes(1);
    });

    test('Announces when not even the fallback options give a chart', async () => {
        const preview = mountPreview(unrenderable, unrenderable);
        wrapper = preview.wrapper;
        await flushPromises();

        expect(preview.chartBridge.init).not.toHaveBeenCalled();
        expect(preview.loadFromCSV).not.toHaveBeenCalled();
        expect(Highcharts.charts.filter((c) => c)).toEqual([]);
        expect(preview.announcer.announce.mock.calls).toEqual([
            ['The chart could not be created.']
        ]);
    });

    test('Announces an update error once when it repeats right away', async () => {
        const preview = mountPreview(renderable, {});
        wrapper = preview.wrapper;
        await flushPromises();

        preview.chartOptions = unrenderable;
        preview.store.commit('viewStore/triggerParameterReactivity');
        await flushPromises();
        preview.store.commit('viewStore/triggerParameterReactivity');
        await flushPromises();

        expect(consoleError.mock.calls.map((call) => call[0])).toEqual([
            'Could not update the chart:',
            'Could not update the chart:'
        ]);
        expect(preview.announcer.announce.mock.calls).toEqual([
            ['The chart could not be updated.']
        ]);
    });
});
