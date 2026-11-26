import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useViewStore } from '../../../src/app/editor/store/modules/view';

describe('view store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('Starts with the default view state', () => {
        const store = useViewStore();
        expect(store.reactToParameterUpdates).toBe(0);
        expect(store.reactToDataUpdates).toBe(0);
        expect(store.selectedHeaderTabId).toBe('Chart');
        expect(store.selectedHeaderTabContent).toBe('chartContent');
        expect(store.expandedSeriesAudioAccordionItems).toEqual({ Instrument: true });
        expect(store.expandedChartMappingsAccordionItems).toEqual({ Basic: true });
    });

    test('Reactivity triggers increment their counters', () => {
        const store = useViewStore();
        store.triggerParameterReactivity();
        store.triggerParameterReactivity();
        store.triggerDataReactivity();
        expect(store.reactToParameterUpdates).toBe(2);
        expect(store.reactToDataUpdates).toBe(1);
    });

    test('selectHeaderTab sets the tab id and its content id', () => {
        const store = useViewStore();
        store.selectHeaderTab({ selectedTabId: 'Data', contentId: 'dataContent' });
        expect(store.selectedHeaderTabId).toBe('Data');
        expect(store.selectedHeaderTabContent).toBe('dataContent');
    });

    test('Accordion item payload actions add and update items', () => {
        const store = useViewStore();
        store.setExpandedSeriesAudioAccordionItem({ itemName: 'Pitch', expanded: true });
        store.setExpandedSeriesAudioAccordionItem({ itemName: 'Instrument', expanded: false });
        store.setExpandedChartMappingsAccordionItem({ itemName: 'Advanced', expanded: true });
        expect(store.expandedSeriesAudioAccordionItems).toEqual({ Instrument: false, Pitch: true });
        expect(store.expandedChartMappingsAccordionItems).toEqual({ Basic: true, Advanced: true });
    });

    test('Simple setters set their value', () => {
        const store = useViewStore();
        store.selectSidebarTab('Audio');
        store.setPlaybackProgress(42);
        store.setSelectedDataSeriesChartMapping('s1');
        store.setSelectedDataSeriesAudioMapping('s2');
        store.setSidebarVisible(false);
        store.setShowChartComponent(false);
        store.setShowGridTools(true);
        store.setLoadingChart(true);
        store.setExpandedGlobalAudioBasicAccordionItem(false);
        store.setExpandedGlobalAudioDefaultsAccordionItem(true);
        store.setExpandedGlobalAudioContextsAccordionItem(true);
        expect(store.$state).toMatchObject({
            selectedSidebarTabId: 'Audio',
            playbackProgress: 42,
            selectedDataSeriesChartMapping: 's1',
            selectedDataSeriesAudioMapping: 's2',
            sidebarVisible: false,
            showChartComponent: false,
            showGridTools: true,
            loadingChart: true,
            expandedGlobalAudioBasicAccordionItem: false,
            expandedGlobalAudioDefaultsAccordionItem: true,
            expandedGlobalAudioContextsAccordionItem: true
        });
    });
});
