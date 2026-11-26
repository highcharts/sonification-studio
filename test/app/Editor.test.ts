import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import Editor from '../../src/app/editor/Editor.vue';
import { storageKey, storageRevision } from '../../src/app/editor/store/store';
import { useChartParametersStore } from '../../src/app/editor/store/modules/chartParameters';
import { useDataStore } from '../../src/app/editor/store/modules/data';
import { useViewStore } from '../../src/app/editor/store/modules/view';
// localStorage app state saved by master v1.1.1 after a set of UI changes
import masterLocalStorageJSON from '../fixtures/localstorage-v1.1.1.json?raw';

const currentKey = storageKey + '-' + storageRevision;

// The data store's placeholder rows, from a store of its own. (Passing a
// Pinia makes it the active one, so the tests pass theirs too.)
function placeholderRows() {
    const data = useDataStore(createPinia());
    data.setToPlaceholderData();
    return data.tableRowData;
}

describe('Editor.vue: initStore', () => {
    let pinia: Pinia;
    let wrapper: VueWrapper | undefined;
    const announcer = { init: vi.fn(), announce: vi.fn() };

    const mountEditor = () => {
        wrapper = shallowMount(Editor, {
            global: {
                plugins: [pinia],
                mocks: { $announcer: announcer }
            }
        });
    };

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        window.localStorage.clear();
        vi.spyOn(console, 'log').mockImplementation(() => void 0);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        window.localStorage.clear();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
        announcer.init.mockClear();
    });

    test('Restores the saved app state in production', () => {
        vi.stubEnv('DEV', false);
        window.localStorage.setItem(currentKey, masterLocalStorageJSON);
        const saved = JSON.parse(masterLocalStorageJSON);

        mountEditor();

        expect(useChartParametersStore(pinia).title).toBe('Fixture Chart Title');
        const data = useDataStore(pinia);
        expect(data.tableRowData).toEqual(saved.dataStore.tableRowData);
        expect(data.tableCSV).toBe(saved.dataStore.tableCSV);
        expect(data.textDescription).toBe('Fixture description: two series, sensor and cosine.');
        expect(console.log).not.toHaveBeenCalled();
    });

    test('Skips the saved app state in development, and loads the placeholder data', async () => {
        vi.stubEnv('DEV', true);
        window.localStorage.setItem(currentKey, masterLocalStorageJSON);

        mountEditor();

        expect(console.log).toHaveBeenCalledWith('Development mode: Skipped loading local storage app state.');
        expect(useChartParametersStore(pinia).title).not.toBe('Fixture Chart Title');
        const data = useDataStore(pinia);
        expect(data.tableRowData).toEqual(placeholderRows());
        expect(data.textDescription).toBe('');

        const view = useViewStore(pinia);
        const counter = view.reactToDataUpdates;
        await nextTick();
        expect(view.reactToDataUpdates).toBe(counter + 1);
        // The saved state is kept for a production build
        expect(window.localStorage.getItem(currentKey)).toBe(masterLocalStorageJSON);
    });

    test('Loads the placeholder data in production when nothing is saved', async () => {
        vi.stubEnv('DEV', false);

        mountEditor();

        expect(useDataStore(pinia).tableRowData).toEqual(placeholderRows());
        const view = useViewStore(pinia);
        const counter = view.reactToDataUpdates;
        await nextTick();
        expect(view.reactToDataUpdates).toBe(counter + 1);
    });

    test.each([['production', false], ['development', true]] as const)(
        'Clears the app state of older storage revisions in %s',
        (_mode, isDev) => {
            vi.stubEnv('DEV', isDev);
            for (let i = 0; i < storageRevision; ++i) {
                window.localStorage.setItem(storageKey + '-' + i, '{}');
            }
            window.localStorage.setItem(currentKey, masterLocalStorageJSON);
            window.localStorage.setItem('unrelated', 'kept');

            mountEditor();

            for (let i = 0; i < storageRevision; ++i) {
                expect(window.localStorage.getItem(storageKey + '-' + i)).toBeNull();
            }
            expect(window.localStorage.getItem(currentKey)).toBe(masterLocalStorageJSON);
            expect(window.localStorage.getItem('unrelated')).toBe('kept');
        }
    );

    test('Initializes the announcer with its live regions', () => {
        vi.stubEnv('DEV', false);

        mountEditor();

        expect(announcer.init).toHaveBeenCalledTimes(1);
        const [polite, assertive] = announcer.init.mock.calls[0];
        expect(polite).toBeInstanceOf(HTMLDivElement);
        expect(assertive).toBeInstanceOf(HTMLDivElement);
        expect(polite).not.toBe(assertive);
    });
});
