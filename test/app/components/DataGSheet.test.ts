import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DataGSheet from '../../../src/app/editor/components/DataGSheet.vue';
import { GoogleSheetStatus, useDataStore } from '../../../src/app/editor/store/modules/data';

describe('DataGSheet.vue', () => {
    let wrapper: VueWrapper<InstanceType<typeof DataGSheet>>;

    beforeEach(() => {
        vi.useFakeTimers();
        const pinia = createPinia();
        setActivePinia(pinia);
        wrapper = mount(DataGSheet, {
            attachTo: document.body,
            global: { plugins: [pinia] }
        });
    });

    afterEach(() => {
        wrapper.unmount();
        vi.useRealTimers();
    });

    // Enter a URL and click Finish, then let the deferred focus run
    const finishWithURL = async (url: string) => {
        useDataStore().setGoogleSpreadsheetURL(url);
        wrapper.vm.onFinishClick();
        // Focus is moved once the DOM is updated
        await vi.advanceTimersByTimeAsync(0);
    };

    const expectSpreadsheetNotFound = () => {
        const data = useDataStore();
        expect(data.spreadsheetSetupComplete).toBe(true);
        expect(data.googleSheetStatus).toBe(GoogleSheetStatus.Error);
        expect(data.googleSheetErrorMessage).toBe('Requested entity was not found');
        expect(wrapper.vm.humanReadableErrorMessage).toContain('We could not find the submitted spreadsheet');
        // Focus moves to the error heading
        expect(document.activeElement?.textContent?.trim()).toBe('Something went wrong');
    };

    test('Rejects a URL that is not a Google Sheets URL', async () => {
        await finishWithURL('https://example.com/spreadsheets/d/abc');
        expectSpreadsheetNotFound();
    });

    test('Rejects an empty URL', async () => {
        await finishWithURL('');
        expectSpreadsheetNotFound();
    });

    test('Completes setup with a Google Sheets URL, waiting for the chart to load it', async () => {
        await finishWithURL('https://docs.google.com/spreadsheets/d/abc-123/edit#gid=0');

        const data = useDataStore();
        expect(data.googleSpreadsheetId).toBe('abc-123');
        expect(data.spreadsheetSetupComplete).toBe(true);
        expect(data.googleSheetStatus).toBe(GoogleSheetStatus.Loading);
        expect(data.googleSheetErrorMessage).toBe('');
        // Focus moves to the loading text
        expect(document.activeElement?.textContent?.trim()).toBe('Loading data...');
    });

    test('Moves the focus from Next to the next step\'s heading right away', async () => {
        const next = wrapper.findAll('.apikeyContent button').find((button) => button.text() === 'Next');
        (next?.element as HTMLButtonElement).focus();
        const focusLog: string[] = [];
        document.addEventListener('focusin', () => focusLog.push(document.activeElement?.tagName || ''));

        await next?.trigger('click');

        expect(document.activeElement?.textContent?.trim()).toBe('Prepare your Google Sheet');
        expect(focusLog).toEqual(['H4']);
    });

    test('Shows the step of a sheet linked in a loaded project or session', async () => {
        const data = useDataStore();
        data.restoreStoreState({
            tableRowData: [],
            selectedDataSource: 'googlesheets',
            spreadsheetSetupComplete: true,
            googleSpreadsheetURL: 'https://docs.google.com/spreadsheets/d/abc/edit',
            googleApiKey: 'key'
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.currentStep).toBe('confirmation');

        // A new project starts the setup over
        data.restoreStoreState();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.currentStep).toBe('apikey');
    });

    test('Starts at the confirmation when the sheet is linked already', () => {
        const linked = mount(DataGSheet, { global: { plugins: [createPinia()] } });
        expect(linked.vm.currentStep).toBe('apikey');
        linked.unmount();

        const pinia = createPinia();
        useDataStore(pinia).restoreStoreState({
            tableRowData: [],
            selectedDataSource: 'googlesheets',
            spreadsheetSetupComplete: true,
            googleSpreadsheetURL: 'https://docs.google.com/spreadsheets/d/abc/edit',
            googleApiKey: 'key'
        });
        setActivePinia(pinia);
        const restored = mount(DataGSheet, { global: { plugins: [pinia] } });
        expect(restored.vm.currentStep).toBe('confirmation');
        restored.unmount();
    });
});
