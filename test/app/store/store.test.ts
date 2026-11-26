import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { effectScope } from 'vue';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import {
    getAppState,
    restoreAppState,
    startLocalStoragePersistence,
    storageKey,
    storageRevision
} from '../../../src/app/editor/store/store';
import { useChartParametersStore } from '../../../src/app/editor/store/modules/chartParameters';
import { useSeriesParametersStore } from '../../../src/app/editor/store/modules/seriesParameters';
import { useDataStore } from '../../../src/app/editor/store/modules/data';
import { useGlobalSonifyParametersStore } from '../../../src/app/editor/store/modules/globalSonifyParameters';
import { useViewStore } from '../../../src/app/editor/store/modules/view';
// localStorage app state saved by master v1.1.1 after a set of UI changes
import masterLocalStorageJSON from '../../fixtures/localstorage-v1.1.1.json?raw';

describe('App state', () => {
    let pinia: Pinia;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
    });

    test('Keeps the storage key and revision', () => {
        expect(storageKey).toBe('highcharts.sonification.studio.appstate');
        expect(storageRevision).toBe(4);
    });

    describe('getAppState', () => {
        test('Returns the state of each store under its former Vuex module name, in order', () => {
            const appState = getAppState();
            expect(Object.keys(appState)).toEqual([
                'chartParametersStore',
                'seriesParametersStore',
                'dataStore',
                'globalSonifyParametersStore',
                'viewStore'
            ]);
            expect(appState.chartParametersStore).toBe(useChartParametersStore().$state);
            expect(appState.seriesParametersStore).toBe(useSeriesParametersStore().$state);
            expect(appState.dataStore).toBe(useDataStore().$state);
            expect(appState.globalSonifyParametersStore).toBe(useGlobalSonifyParametersStore().$state);
            expect(appState.viewStore).toBe(useViewStore().$state);
        });

        test('Serializes to the same JSON shape as the Vuex root state', () => {
            useChartParametersStore().setTitle('Title');
            useSeriesParametersStore().setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 1 });
            useDataStore().setTableRowData([{ A: 'x' }, { A: '1' }]);

            const json = JSON.parse(JSON.stringify(getAppState()));

            expect(Object.keys(json.chartParametersStore)).toEqual([
                'type', 'legendEnabled', 'inverted', 'title', 'subtitle', 'xAxisTitle', 'xAxisType',
                'xAxisVisible', 'xAxisMin', 'xAxisMax', 'yAxisTitle', 'yAxisType', 'yAxisVisible',
                'yAxisMin', 'yAxisMax', 'seriesLabelsEnabled', 'sharedTooltipEnabled', 'zoomType',
                'dataGroupingType'
            ]);
            expect(json.chartParametersStore.title).toBe('Title');
            expect(json.seriesParametersStore).toEqual({ seriesParameters: { s: { a: 1 } } });
            expect(json.dataStore).toEqual({
                tableCSV: 'x\n1',
                tableRowData: [{ A: 'x' }, { A: '1' }],
                tableHeaders: [],
                textDescription: '',
                selectedDataSource: 'table',
                spreadsheetSetupComplete: false,
                googleSpreadsheetURL: '',
                googleApiKey: '',
                googleAutoUpdateEnabled: false,
                googleAutoUpdateFrequency: 10,
                googleSheetStatus: 0,
                googleSheetErrorMessage: '',
                dataSourcesList: [
                    { name: 'Grid', value: 'table' },
                    { name: 'Google Sheets', value: 'googlesheets' }
                ]
            });
            expect(Object.keys(json.dataStore)).toEqual([
                'tableCSV', 'tableRowData', 'tableHeaders', 'textDescription', 'selectedDataSource',
                'spreadsheetSetupComplete', 'googleSpreadsheetURL', 'googleApiKey', 'googleAutoUpdateEnabled',
                'googleAutoUpdateFrequency', 'googleSheetStatus', 'googleSheetErrorMessage', 'dataSourcesList'
            ]);
            expect(Object.keys(json.globalSonifyParametersStore)).toEqual([
                'volume', 'speed', 'order', 'playMarkerEnabled', 'tooltipMarkerEnabled', 'minNote',
                'maxNote', 'panEnabled', 'panWidth', 'detail', 'contexts'
            ]);
            expect(Object.keys(json.viewStore)).toEqual([
                'reactToParameterUpdates', 'reactToDataUpdates', 'showChartComponent', 'loadingChart',
                'selectedHeaderTabContent', 'selectedHeaderTabId', 'selectedSidebarTabId', 'sidebarVisible',
                'showGridTools', 'playbackProgress', 'selectedDataSeriesChartMapping',
                'selectedDataSeriesAudioMapping', 'expandedGlobalAudioBasicAccordionItem',
                'expandedGlobalAudioDefaultsAccordionItem', 'expandedGlobalAudioContextsAccordionItem',
                'expandedSeriesAudioAccordionItems', 'expandedChartMappingsAccordionItems'
            ]);
        });

        test('Uses the given pinia instead of the active one', () => {
            const other = createPinia();
            useChartParametersStore(other).setTitle('Other');
            // Using a store makes its pinia the active one
            setActivePinia(pinia);
            expect(getAppState().chartParametersStore.title).toBe('Test chart');
            expect(getAppState(other).chartParametersStore.title).toBe('Other');
        });
    });

    describe('restoreAppState', () => {
        const recordRestoreCalls = (p: Pinia) => {
            const calls: string[] = [];
            const record = (id: string) => ({ name }: { name: string }) => {
                if (name === 'restoreStoreState') {
                    calls.push(id);
                }
            };
            useChartParametersStore(p).$onAction(record('chartParameters'));
            useSeriesParametersStore(p).$onAction(record('seriesParameters'));
            useDataStore(p).$onAction(record('data'));
            useGlobalSonifyParametersStore(p).$onAction(record('globalSonifyParameters'));
            useViewStore(p).$onAction(record('view'));
            return calls;
        };

        test('Restores the stores in the old order, but not the view store', () => {
            const calls = recordRestoreCalls(pinia);
            restoreAppState({});
            expect(calls).toEqual(['chartParameters', 'globalSonifyParameters', 'data', 'seriesParameters']);
        });

        test('Restores defaults and placeholder data without a new state', () => {
            useChartParametersStore().setTitle('Changed');
            useGlobalSonifyParametersStore().setVolume(1);
            useSeriesParametersStore().setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 1 });
            useViewStore().selectSidebarTab('Audio');

            restoreAppState();

            expect(useChartParametersStore().title).toBe('Test chart');
            expect(useGlobalSonifyParametersStore().volume).toBe(70);
            expect(useSeriesParametersStore().seriesParameters).toEqual({});
            expect(useDataStore().tableRowData).toHaveLength(200);
            expect(useViewStore().selectedSidebarTabId).toBe('Audio');
        });

        test('Restores a saved app state into fresh stores', () => {
            const chartParams = useChartParametersStore();
            chartParams.setTitle('Saved');
            chartParams.setType('line');
            useGlobalSonifyParametersStore().setSpeed(10);
            useGlobalSonifyParametersStore().addContext({ valueRange: null, inactive: true });
            useSeriesParametersStore().setSeriesParameter({
                seriesId: 's', parameterName: 'instrument', parameterValue: 'flute', nestedUnderParent: 'instrument'
            });
            useDataStore().setTableRowData([{ A: 'x', B: 'y' }, { A: '1', B: '2' }]);
            useDataStore().setTextDescription('Saved description');
            useViewStore().selectSidebarTab('Audio');

            const saved = JSON.parse(JSON.stringify(getAppState()));

            const fresh = createPinia();
            restoreAppState(saved, fresh);
            const restored = JSON.parse(JSON.stringify(getAppState(fresh)));

            expect(restored.chartParametersStore).toEqual(saved.chartParametersStore);
            expect(restored.globalSonifyParametersStore).toEqual(saved.globalSonifyParametersStore);
            expect(restored.seriesParametersStore).toEqual(saved.seriesParametersStore);
            expect(restored.dataStore.tableRowData).toEqual(saved.dataStore.tableRowData);
            expect(restored.dataStore.tableCSV).toBe('x;y\n1;2');
            expect(restored.dataStore.textDescription).toBe('Saved description');
            // The view store is not restored
            expect(restored.viewStore.selectedSidebarTabId).toBe('Visual');
            // The other pinia is left alone
            expect(useChartParametersStore(pinia).title).toBe('Saved');
            expect(useViewStore(pinia).selectedSidebarTabId).toBe('Audio');
        });
    });

    describe('Compatibility with the localStorage state of master v1.1.1', () => {
        // Parsed like the app does, so the master values keep their types
        // (e.g. a context interval saved as the string "10")
        const masterState = () => JSON.parse(masterLocalStorageJSON);
        // Version keys that master leaked into later saves; restore ignores them
        const versionKeys = ['appVersion', 'storeVersion'];

        test('Restores the stores per the restore rules', () => {
            const saved = masterState();
            // tooltipMarkerEnabled is not restored, so a changed value stays
            useGlobalSonifyParametersStore(pinia).setTooltipMarkerEnabled(true);
            const viewDefaults = JSON.parse(JSON.stringify(useViewStore(pinia).$state));

            restoreAppState(saved, pinia);

            expect(useChartParametersStore(pinia).$state).toEqual(saved.chartParametersStore);
            expect(useChartParametersStore(pinia).title).toBe('Fixture Chart Title');

            const seriesParams = useSeriesParametersStore(pinia).seriesParameters;
            expect(seriesParams).toEqual(saved.seriesParametersStore.seriesParameters);
            expect(seriesParams['se-hc-series-id-0'].instrument).toEqual({ pitchRoundingEnabled: true, instrument: 'flute' });
            expect(seriesParams['se-hc-series-id-0']).not.toBe(saved.seriesParametersStore.seriesParameters['se-hc-series-id-0']);

            const globalSonify = useGlobalSonifyParametersStore(pinia);
            expect(globalSonify.$state).toEqual({ ...saved.globalSonifyParametersStore, tooltipMarkerEnabled: true });
            expect(globalSonify.contexts.map(c => [c.id, c.valueInterval])).toEqual([[1, 1], [2, '10']]);
            globalSonify.addContext({ valueRange: null, inactive: false });
            expect(globalSonify.contexts[2].id).toBe(3);

            const data = useDataStore(pinia);
            expect(data.tableRowData).toEqual(saved.dataStore.tableRowData);
            expect(data.tableRowData).toHaveLength(199);
            expect(data.tableRowData[1]).toEqual({ A: 1, B: 42.5, C: 58.8, D: '', E: '', F: '', G: '' });
            expect(data.tableRowData[4].C).toBe(-12);
            expect(data.textDescription).toBe('Fixture description: two series, sensor and cosine.');
            // Regenerated from the rows, the same as master's
            expect(data.tableCSV).toBe(saved.dataStore.tableCSV);

            // The view store is not restored
            expect(useViewStore(pinia).$state).toEqual(viewDefaults);
        });

        test('Serializes with the same keys, in the same order, as master', () => {
            const saved = masterState();
            // Restoring ignores the version keys master leaked into later saves
            restoreAppState({ ...saved, appVersion: '1.1.1', storeVersion: 4 }, pinia);
            const serialized = JSON.parse(JSON.stringify(getAppState(pinia)));

            const savedKeys = Object.keys(saved).filter(key => !versionKeys.includes(key));
            expect(Object.keys(serialized)).toEqual(savedKeys);
            savedKeys.forEach(key => {
                expect(Object.keys(serialized[key])).toEqual(Object.keys(saved[key]));
            });

            // Apart from the view store, which is not restored, the state
            // serializes exactly as master saved it
            const withoutView = (state: Record<string, unknown>) => JSON.stringify(
                Object.fromEntries(Object.entries(state).filter(
                    ([key]) => key !== 'viewStore' && !versionKeys.includes(key))));
            expect(withoutView(serialized)).toBe(withoutView(saved));
        });

        test('Round-trips through getAppState and restoreAppState unchanged', () => {
            restoreAppState(masterState(), pinia);
            const first = JSON.stringify(getAppState(pinia));

            const fresh = createPinia();
            restoreAppState(JSON.parse(first), fresh);
            expect(JSON.stringify(getAppState(fresh))).toBe(first);

            restoreAppState(JSON.parse(first), pinia);
            expect(JSON.stringify(getAppState(pinia))).toBe(first);
        });
    });

    describe('startLocalStoragePersistence', () => {
        const key = 'highcharts.sonification.studio.appstate-4';
        let stop: (() => void) | undefined;
        let setItem: MockInstance<Storage['setItem']>;

        beforeEach(() => {
            vi.useFakeTimers();
            setItem = vi.spyOn(Storage.prototype, 'setItem');
            window.localStorage.clear();
        });

        afterEach(() => {
            stop?.();
            stop = undefined;
            vi.useRealTimers();
            vi.restoreAllMocks();
        });

        test('Saves the app state 2 seconds after the last non-view action', () => {
            stop = startLocalStoragePersistence(pinia);
            const chartParams = useChartParametersStore(pinia);

            chartParams.setTitle('First');
            vi.advanceTimersByTime(1999);
            expect(setItem).not.toHaveBeenCalled();

            // Another action restarts the wait
            chartParams.setTitle('Second');
            vi.advanceTimersByTime(1999);
            expect(setItem).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(setItem).toHaveBeenCalledTimes(1);
            expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(getAppState(pinia)));
            expect(JSON.parse(window.localStorage.getItem(key) as string).chartParametersStore.title).toBe('Second');
        });

        test('Saves after actions on each non-view store', () => {
            stop = startLocalStoragePersistence(pinia);
            const actions = [
                () => useChartParametersStore(pinia).setTitle('A'),
                () => useSeriesParametersStore(pinia).clearState(),
                () => useDataStore(pinia).setTableCSV(''),
                () => useGlobalSonifyParametersStore(pinia).setVolume(1)
            ];
            actions.forEach((action, i) => {
                action();
                vi.advanceTimersByTime(2000);
                expect(setItem).toHaveBeenCalledTimes(i + 1);
            });
        });

        test('Saves after an edit of a context cue', () => {
            const globalSonify = useGlobalSonifyParametersStore(pinia);
            globalSonify.addContext({ valueRange: null, inactive: false });
            const id = globalSonify.contexts[0].id;
            stop = startLocalStoragePersistence(pinia);

            globalSonify.setContextParameter({ id, parameterName: 'volume', value: 30 });
            vi.advanceTimersByTime(2000);
            expect(setItem).toHaveBeenCalledTimes(1);
            const saved = JSON.parse(window.localStorage.getItem(key) as string);
            expect(saved.globalSonifyParametersStore.contexts[0].volume).toBe(30);
        });

        test('Saves the state as it is when the timer fires', () => {
            stop = startLocalStoragePersistence(pinia);
            useChartParametersStore(pinia).setTitle('A');
            vi.advanceTimersByTime(1000);
            // View changes do not restart the wait, but are saved with the rest
            useViewStore(pinia).selectSidebarTab('Audio');
            vi.advanceTimersByTime(1000);
            expect(setItem).toHaveBeenCalledTimes(1);
            expect(JSON.parse(window.localStorage.getItem(key) as string).viewStore.selectedSidebarTabId).toBe('Audio');
        });

        test('Does not save after view-only actions', () => {
            stop = startLocalStoragePersistence(pinia);
            const view = useViewStore(pinia);
            view.triggerDataReactivity();
            view.triggerParameterReactivity();
            view.setPlaybackProgress(50);
            vi.advanceTimersByTime(10000);
            expect(setItem).not.toHaveBeenCalled();
        });

        test('Logs an error when saving fails', () => {
            const error = new Error('Quota exceeded');
            setItem.mockImplementation(() => {
                throw error;
            });
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            stop = startLocalStoragePersistence(pinia);

            useDataStore(pinia).setToPlaceholderData();
            vi.advanceTimersByTime(2000);

            expect(setItem).toHaveBeenCalledTimes(1);
            expect(consoleError).toHaveBeenCalledWith('Error attempting to store app state:', error);
        });

        test('Keeps saving after the scope it was started in is disposed', () => {
            const scope = effectScope();
            scope.run(() => {
                stop = startLocalStoragePersistence(pinia);
            });
            scope.stop();

            useChartParametersStore(pinia).setTitle('A');
            vi.advanceTimersByTime(2000);
            expect(setItem).toHaveBeenCalledTimes(1);
        });

        test('Stops saving, and drops a pending save, when stopped', () => {
            const stopPersistence = startLocalStoragePersistence(pinia);
            useChartParametersStore(pinia).setTitle('A');
            stopPersistence();
            vi.advanceTimersByTime(2000);
            useChartParametersStore(pinia).setTitle('B');
            vi.advanceTimersByTime(2000);
            expect(setItem).not.toHaveBeenCalled();
        });

        test('Only watches the given pinia', () => {
            stop = startLocalStoragePersistence(pinia);
            useChartParametersStore(createPinia()).setTitle('A');
            vi.advanceTimersByTime(2000);
            expect(setItem).not.toHaveBeenCalled();
        });
    });
});
