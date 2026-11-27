import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, type Pinia } from 'pinia';
import ProjectMenu from '../../../src/app/editor/components/ProjectMenu.vue';
import SEFileUpload from '../../../src/app/editor/components/basic/SEFileUpload.vue';
import { useChartParametersStore } from '../../../src/app/editor/store/modules/chartParameters';
import { useSeriesParametersStore } from '../../../src/app/editor/store/modules/seriesParameters';
import { useDataStore } from '../../../src/app/editor/store/modules/data';
import { useGlobalSonifyParametersStore } from '../../../src/app/editor/store/modules/globalSonifyParameters';
import { getGridRebuild } from '../../../src/app/editor/core/utils/gridData';
import { useViewStore } from '../../../src/app/editor/store/modules/view';
import fixtureContents from '../../fixtures/project-v1.1.1.hssp?raw';

// Long enough for the chart to be removed, recreated and done loading
const recreateChartMs = 2000;

describe('ProjectMenu.vue', () => {
    let pinia: Pinia;
    let wrapper: VueWrapper;
    let confirm: MockInstance<typeof window.confirm>;
    const chartBridge = { init: vi.fn(), getChartTitleForExport: () => 'Title' };
    const announcer = { announce: vi.fn() };

    const menuItem = (label: string) => wrapper.findAll<HTMLButtonElement>('.se-dropdownmenu-popup button')
        .find(b => b.text() === label)!;

    // The placeholder rows, from a data store of its own
    const placeholderRows = () => {
        const data = useDataStore(createPinia());
        data.setToPlaceholderData();
        return data.tableRowData;
    };

    beforeEach(() => {
        vi.useFakeTimers();
        // The tests pass this pinia to each store, as placeholderRows()
        // makes another pinia the active one
        pinia = createPinia();
        useDataStore(pinia).setTableRowData([{ A: 'x', B: 'y' }, { A: '1', B: '2' }]);
        useSeriesParametersStore(pinia).setSeriesParameter({
            seriesId: 'old-series', parameterName: 'seriesName', parameterValue: 'Old'
        });
        useChartParametersStore(pinia).setTitle('Old title');
        confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        wrapper = mount(ProjectMenu, {
            attachTo: document.body,
            global: {
                plugins: [pinia],
                mocks: { $chartBridge: chartBridge, $announcer: announcer }
            }
        });
    });

    afterEach(() => {
        wrapper.unmount();
        vi.useRealTimers();
        vi.restoreAllMocks();
        chartBridge.init.mockClear();
        announcer.announce.mockClear();
    });

    test('New Project resets the data and all settings, recreates the chart and announces it', async () => {
        const globalSonify = useGlobalSonifyParametersStore(pinia);
        globalSonify.addContext({ valueRange: null, inactive: false });
        const data = useDataStore(pinia);
        data.setTextDescription('Old description');
        data.setSelectedDataSource('googlesheets');
        data.setGoogleApiKey('key');
        // The data store actions that rebuild the grid
        const gridActions: string[] = [];
        data.$onAction(({ name }) => {
            if (getGridRebuild(name, { isUpdatingFromGrid: false, hasRendered: true, onDataTab: true }) !== 'none') {
                gridActions.push(name);
            }
        });

        await menuItem('New Project').trigger('click');
        expect(confirm).toHaveBeenCalledTimes(1);
        expect(useViewStore(pinia).loadingChart).toBe(true);

        await vi.advanceTimersByTimeAsync(recreateChartMs);

        expect(data.tableRowData).toEqual(placeholderRows());
        expect(data.textDescription).toBe('');
        expect(data.selectedDataSource).toBe('table');
        // The user's own key stays
        expect(data.googleApiKey).toBe('key');
        expect(useSeriesParametersStore(pinia).seriesParameters).toEqual({});
        // The chart and audio settings, as the confirmation says
        expect(useChartParametersStore(pinia).title).toBe('Test chart');
        expect(globalSonify.contexts).toEqual([]);
        // The grid is built once
        expect(gridActions).toEqual(['restoreStoreState']);
        expect(chartBridge.init).toHaveBeenCalledTimes(1);
        expect(announcer.announce).toHaveBeenCalledWith('New project loaded.');
        const view = useViewStore(pinia);
        expect(view.showChartComponent).toBe(true);
        expect(view.loadingChart).toBe(false);
    });

    test('Enter on New Project asks for confirmation once', () => {
        confirm.mockReturnValue(false);
        const item = menuItem('New Project').element;
        item.focus();

        // What a browser does on Enter: keydown, then a click on the button
        const keydown = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        item.dispatchEvent(keydown);
        if (!keydown.defaultPrevented) {
            item.click();
        }

        expect(confirm).toHaveBeenCalledTimes(1);
    });

    test('New Project keeps everything when not confirmed', async () => {
        confirm.mockReturnValue(false);

        await menuItem('New Project').trigger('click');
        await vi.advanceTimersByTimeAsync(recreateChartMs);

        expect(useDataStore(pinia).tableRowData).toEqual([{ A: 'x', B: 'y' }, { A: '1', B: '2' }]);
        expect(useSeriesParametersStore(pinia).seriesParameters).toHaveProperty('old-series');
        expect(useViewStore(pinia).loadingChart).toBe(false);
        expect(chartBridge.init).not.toHaveBeenCalled();
        expect(announcer.announce).not.toHaveBeenCalled();
    });

    test('Open Project loads the project file, recreates the chart and announces it', async () => {
        wrapper.findComponent(SEFileUpload).vm.$emit('load', fixtureContents);

        await vi.advanceTimersByTimeAsync(recreateChartMs);

        expect(useChartParametersStore(pinia).title).toBe('Fixture Chart Title');
        expect(useSeriesParametersStore(pinia).seriesParameters).not.toHaveProperty('old-series');
        expect(useDataStore(pinia).tableRowData).toHaveLength(199);
        expect(chartBridge.init).toHaveBeenCalledTimes(1);
        expect(announcer.announce).toHaveBeenCalledWith('Project loaded.');
        expect(useViewStore(pinia).loadingChart).toBe(false);
    });

    test('Open Project announces a file it cannot load', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(window, 'alert').mockImplementation(() => undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        wrapper.findComponent(SEFileUpload).vm.$emit('load', 'not a project file');
        await vi.advanceTimersByTimeAsync(recreateChartMs);

        expect(announcer.announce).toHaveBeenCalledWith('Error loading project.');
        expect(error).toHaveBeenCalled();
        expect(useViewStore(pinia).loadingChart).toBe(false);
    });
});
