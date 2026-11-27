import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import {
    downloadProjectFile,
    restoreFromProjectFile
} from '../../../src/app/editor/core/utils/projectFileHandling';
import { downloadURI } from '../../../src/app/editor/core/utils/browserUtils';
import { getAppState } from '../../../src/app/editor/store/store';
import { useChartParametersStore } from '../../../src/app/editor/store/modules/chartParameters';
import { useSeriesParametersStore } from '../../../src/app/editor/store/modules/seriesParameters';
import { tableCSVDelimiter, useDataStore } from '../../../src/app/editor/store/modules/data';
import { useGlobalSonifyParametersStore } from '../../../src/app/editor/store/modules/globalSonifyParameters';
import { useViewStore } from '../../../src/app/editor/store/modules/view';
import { version } from '../../../package.json';
import fixtureContents from '../../fixtures/project-v1.1.1.hssp?raw';

vi.mock('../../../src/app/editor/core/utils/browserUtils', () => ({
    downloadURI: vi.fn()
}));

// A project saved with "Save Project As" in master v1.1.1 (Vuex), read as
// UTF-8 text like SEFileUpload does.
const fixtureState = JSON.parse(decompressFromUTF16(fixtureContents));

// The state the stores serialize to, as a plain object
const appStateJSON = (pinia?: Pinia) => JSON.parse(JSON.stringify(getAppState(pinia)));

describe('Project file handling', () => {
    let pinia: Pinia;
    let warn: MockInstance<typeof console.warn>;
    let alert: MockInstance<typeof window.alert>;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.mocked(downloadURI).mockClear();
    });

    describe('restoreFromProjectFile', () => {
        test('Loads a project file saved by master v1.1.1', () => {
            expect(fixtureState.appVersion).toBe('1.1.1');
            expect(fixtureState.storeVersion).toBe(4);

            // State that the project file must replace, or must leave alone
            useSeriesParametersStore().setSeriesParameter({
                seriesId: 'old-series', parameterName: 'seriesName', parameterValue: 'Old'
            });
            useGlobalSonifyParametersStore().setTooltipMarkerEnabled(true);
            useDataStore().setSelectedDataSource('googlesheets');
            useDataStore().setGoogleApiKey('editor key');
            useViewStore().selectSidebarTab('Audio');
            const viewStateBefore = JSON.stringify(useViewStore().$state);

            restoreFromProjectFile(fixtureContents);

            expect(warn).not.toHaveBeenCalled();
            expect(alert).not.toHaveBeenCalled();

            // Chart parameters: every key from the file
            expect(appStateJSON().chartParametersStore).toEqual(fixtureState.chartParametersStore);
            const chartParams = useChartParametersStore();
            expect(chartParams.title).toBe('Fixture Chart Title');
            expect(chartParams.type).toBe('column');
            expect(chartParams.zoomType).toBe('xy');

            // Series parameters: replaced by the file's, including nested parameters
            const seriesParams = useSeriesParametersStore().seriesParameters;
            expect(JSON.parse(JSON.stringify(seriesParams))).toEqual(fixtureState.seriesParametersStore.seriesParameters);
            expect(seriesParams['old-series']).toBeUndefined();
            expect(seriesParams['se-hc-series-id-0'].seriesName).toBe('Sensor');
            expect(seriesParams['se-hc-series-id-0'].instrument).toEqual({
                pitchRoundingEnabled: true, instrument: 'flute'
            });
            expect(seriesParams['se-hc-series-id-0'].pitchOptions).toEqual({
                mapTo: 'y', min: 50, max: 90, fixedValue: 55, polarity: 'negative', mappingType: 'mapped'
            });
            expect(seriesParams['se-hc-series-id-1'].seriesVisible).toBe(false);

            // Global sonification parameters: every key from the file
            const globalSonify = useGlobalSonifyParametersStore();
            const restoredKeys = [
                'volume', 'playMarkerEnabled', 'tooltipMarkerEnabled', 'minNote', 'maxNote', 'panEnabled',
                'panWidth', 'detail', 'speed', 'order', 'contexts'
            ] as const;
            restoredKeys.forEach(key => expect(JSON.parse(JSON.stringify(globalSonify[key])))
                .toEqual(fixtureState.globalSonifyParametersStore[key]));
            expect(globalSonify.volume).toBe(55);
            expect(globalSonify.order).toBe('sequential');
            expect(globalSonify.contexts.map(c => c.id)).toEqual([1, 2]);
            expect(globalSonify.contexts[1]).toMatchObject({
                valueInterval: '10', playWhenType: 'always', instrument: 'shaker', pitchNote: 72, pan: 20
            });
            // The file's false replaces the true set above
            expect(globalSonify.tooltipMarkerEnabled).toBe(false);
            // New contexts continue after the loaded ids
            globalSonify.addContext({ valueRange: null, inactive: false });
            expect(globalSonify.contexts[2].id).toBe(3);

            // Data: the rows and the text description, with the CSV generated from the rows
            const data = useDataStore();
            expect(data.tableRowData).toEqual(fixtureState.dataStore.tableRowData);
            expect(data.tableRowData).toHaveLength(199);
            expect(data.tableRowData[1].B).toBe(42.5);
            expect(data.tableRowData[4].C).toBe(-12);
            expect(data.tableCSV).toBe(fixtureState.dataStore.tableCSV);
            expect(data.textDescription).toBe('Fixture description: two series, sensor and cosine.');
            // The data source settings, but not the file's Google API key:
            // the editor keeps its own
            expect(data.selectedDataSource).toBe('table');
            expect(data.googleSpreadsheetURL).toBe('');
            expect(data.googleAutoUpdateEnabled).toBe(false);
            expect(data.googleAutoUpdateFrequency).toBe(10);
            expect(data.spreadsheetSetupComplete).toBe(false);
            expect(data.googleApiKey).toBe('editor key');

            // The view store is not restored
            expect(JSON.stringify(useViewStore().$state)).toBe(viewStateBefore);
        });

        test('Restores into the given pinia', () => {
            const other = createPinia();
            restoreFromProjectFile(fixtureContents, other);
            expect(useChartParametersStore(other).title).toBe('Fixture Chart Title');
            expect(useChartParametersStore(pinia).title).toBe('Test chart');
        });

        test('Warns and alerts when loading an older project file version', () => {
            const oldFile = compressToUTF16(JSON.stringify({ ...fixtureState, storeVersion: 3 }));

            restoreFromProjectFile(oldFile);

            expect(warn).toHaveBeenCalledWith('Loading project format version 3. Current version is 4.');
            expect(alert).toHaveBeenCalledOnce();
            expect(alert.mock.calls[0][0]).toContain('older version');
            // Still loaded
            expect(useChartParametersStore().title).toBe('Fixture Chart Title');
        });

        test('Warns and alerts when the project file has no version', () => {
            const { storeVersion, ...unversioned } = fixtureState;
            expect(storeVersion).toBe(4);

            restoreFromProjectFile(compressToUTF16(JSON.stringify(unversioned)));

            expect(warn).toHaveBeenCalledWith('Loading project format version undefined. Current version is 4.');
            expect(alert).toHaveBeenCalledOnce();
            expect(useChartParametersStore().title).toBe('Fixture Chart Title');
        });

        test('Throws on contents that are not a project file, leaving the stores alone', () => {
            useChartParametersStore().setTitle('Unchanged');

            expect(() => restoreFromProjectFile('')).toThrow('Project file not valid.');
            expect(() => restoreFromProjectFile('not a project file')).toThrow();
            expect(() => restoreFromProjectFile(compressToUTF16('{ not json'))).toThrow(SyntaxError);

            expect(useChartParametersStore().title).toBe('Unchanged');
            expect(alert).not.toHaveBeenCalled();
        });
    });

    describe('downloadProjectFile', () => {
        let createObjectURL: ReturnType<typeof vi.fn<(blob: Blob) => string>>;

        beforeEach(() => {
            createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:project');
            // jsdom has no URL.createObjectURL
            window.URL.createObjectURL = createObjectURL;
        });

        // Download the project file and return its text
        const download = async (title: string, p?: Pinia): Promise<string> => {
            downloadProjectFile(title, p);
            expect(createObjectURL).toHaveBeenCalledOnce();
            const blob = createObjectURL.mock.calls[0][0];
            expect(blob.type).toBe('application/octet-stream');
            createObjectURL.mockClear();
            return blob.text();
        };

        test('Saves the app state and versions in the master format', async () => {
            const contents = await download('My project');

            expect(downloadURI).toHaveBeenCalledWith('blob:project', 'My project.hssp');
            const saved = JSON.parse(decompressFromUTF16(contents));
            expect(Object.keys(saved)).toEqual([
                'chartParametersStore',
                'seriesParametersStore',
                'dataStore',
                'globalSonifyParametersStore',
                'viewStore',
                'appVersion',
                'storeVersion'
            ]);
            expect(saved.appVersion).toBe(version);
            expect(saved.storeVersion).toBe(4);
            // Same keys, in the same order, as master wrote in each section,
            // but no Google API key
            for (const section of ['chartParametersStore', 'seriesParametersStore', 'dataStore',
                'globalSonifyParametersStore', 'viewStore']) {
                expect(Object.keys(saved[section])).toEqual(
                    Object.keys(fixtureState[section]).filter((key) => key !== 'googleApiKey')
                );
            }
        });

        test('Leaves out the Google API key, which a loaded file does not replace', async () => {
            const data = useDataStore();
            data.setSelectedDataSource('googlesheets');
            data.setGoogleApiKey('secret key');
            data.setGoogleSpreadsheetURL('https://docs.google.com/spreadsheets/d/abc123/edit');
            data.setGoogleAutoUpdateEnabled(true);
            data.setSpreadsheetSetupComplete(true);

            const contents = await download('Shared');
            expect(decompressFromUTF16(contents)).not.toContain('secret key');
            const saved = JSON.parse(decompressFromUTF16(contents));
            expect(saved.dataStore).not.toHaveProperty('googleApiKey');

            // Opened in another editor, with its own key, or with none
            const other = createPinia();
            useDataStore(other).setGoogleApiKey('other key');
            restoreFromProjectFile(contents, other);
            expect(useDataStore(other)).toMatchObject({
                selectedDataSource: 'googlesheets',
                googleSpreadsheetURL: 'https://docs.google.com/spreadsheets/d/abc123/edit',
                googleAutoUpdateEnabled: true,
                googleApiKey: 'other key',
                spreadsheetSetupComplete: true
            });

            const withoutKey = createPinia();
            restoreFromProjectFile(contents, withoutKey);
            // The setup starts over at the API key, with the rest filled in
            expect(useDataStore(withoutKey)).toMatchObject({
                selectedDataSource: 'googlesheets',
                googleSpreadsheetURL: 'https://docs.google.com/spreadsheets/d/abc123/edit',
                googleApiKey: '',
                spreadsheetSetupComplete: false
            });
        });

        test('Does not take the Google API key from a file saved with one', () => {
            // Files saved before version 1.2.1 have the key
            const withKey = compressToUTF16(JSON.stringify({
                ...fixtureState,
                dataStore: { ...fixtureState.dataStore, googleApiKey: 'saved key' }
            }));
            restoreFromProjectFile(withKey);
            expect(useDataStore().googleApiKey).toBe('');
        });

        test('Saves a loaded master project as master saved it, apart from the view state', async () => {
            restoreFromProjectFile(fixtureContents);

            const saved = JSON.parse(decompressFromUTF16(await download('Resaved')));

            for (const section of ['chartParametersStore', 'seriesParametersStore',
                'globalSonifyParametersStore']) {
                expect(JSON.stringify(saved[section])).toBe(JSON.stringify(fixtureState[section]));
            }
            // The data, apart from the Google API key
            const { googleApiKey, ...fixtureData } = fixtureState.dataStore;
            expect(googleApiKey).toBe('');
            expect(JSON.stringify(saved.dataStore)).toBe(JSON.stringify(fixtureData));
        });

        test('Round-trips through restoreFromProjectFile', async () => {
            restoreFromProjectFile(fixtureContents);
            useChartParametersStore().setSubtitle('Changed after loading');
            useSeriesParametersStore().setSeriesParameter({
                seriesId: 'se-hc-series-id-1', parameterName: 'min', parameterValue: 40, nestedUnderParent: 'pitchOptions'
            });
            // A cell edit, as the grid stores it
            const data = useDataStore();
            data.setTableRowData(data.tableRowData.map((row, i) => i === 2 ? { ...row, B: '7' } : row));
            data.setTextDescription('Changed description');
            useGlobalSonifyParametersStore().removeContext(1);

            const contents = await download('Round trip', pinia);

            const fresh = createPinia();
            restoreFromProjectFile(contents, fresh);
            expect(warn).not.toHaveBeenCalled();
            expect(alert).not.toHaveBeenCalled();

            const original = appStateJSON(pinia);
            const restored = appStateJSON(fresh);
            expect(restored.chartParametersStore).toEqual(original.chartParametersStore);
            expect(restored.seriesParametersStore).toEqual(original.seriesParametersStore);
            expect(restored.globalSonifyParametersStore).toEqual(original.globalSonifyParametersStore);
            expect(restored.dataStore.tableRowData).toEqual(original.dataStore.tableRowData);
            expect(restored.dataStore.tableCSV).toBe(original.dataStore.tableCSV);
            expect(restored.dataStore.textDescription).toBe('Changed description');
            expect(restored.seriesParametersStore.seriesParameters['se-hc-series-id-1'].pitchOptions.min).toBe(40);
        });

        test('Keeps the data in its columns over repeated saves and loads', async () => {
            const data = useDataStore();
            // Empty cells before values: a blank header cell over the row
            // labels, a cleared cell in the first data row, a gap. Values
            // with the CSV delimiter and quotes.
            data.setTableRowData([
                { A: '', B: 'Temp; C', C: 'Say "hi"' },
                { A: '', B: '0.5', C: '7' },
                { A: '1', B: '', C: '8;9' }
            ]);
            const csv = ';"Temp; C";"Say ""hi"""\n;0.5;7\n1;;"8;9"';
            expect(data.tableCSV).toBe(csv);

            for (let i = 0; i < 3; i++) {
                restoreFromProjectFile(await download('Round trip'));

                expect(data.tableCSV).toBe(csv);
                // The rows keep their empty cells, so the columns that have
                // only those keep their series (see buildChartOptions)
                expect(data.tableRowData).toEqual([
                    { A: '', B: 'Temp; C', C: 'Say "hi"' },
                    { A: '', B: '0.5', C: '7' },
                    { A: '1', B: '', C: '8;9' }
                ]);
            }

            // Loaded from the CSV, as from an imported CSV file, the rows have
            // no cells for the empty values, and the values keep their columns
            data.loadFromCSV(data.tableCSV, tableCSVDelimiter);
            expect(data.tableCSV).toBe(csv);
            expect(data.tableRowData).toEqual([
                { B: 'Temp; C', C: 'Say "hi"' },
                { B: '0.5', C: '7' },
                { A: '1', C: '8;9' }
            ]);
        });

        test('Keeps a single column of data over saves and loads', async () => {
            const data = useDataStore();
            const rows = [{ A: 'Value' }, { A: '1,5' }, { A: '2,5' }];
            data.setTableRowData(rows);

            for (let i = 0; i < 2; i++) {
                restoreFromProjectFile(await download('Single column'));
                expect(data.tableRowData).toEqual(rows);
                data.loadFromCSV(data.tableCSV, tableCSVDelimiter);
                expect(data.tableRowData).toEqual(rows);
            }
        });
    });
});
