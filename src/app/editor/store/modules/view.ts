/*
    Data store for data that is specific to the app view components, but
    used across multiple components.
*/

import { defineStore } from 'pinia';

export interface SelectHeaderTabPayload {
    selectedTabId: string;
    contentId: string;
}

export interface ExpandedAccordionItemPayload {
    itemName: string;
    expanded: boolean;
}

export interface ViewState {
    reactToParameterUpdates: number;
    reactToDataUpdates: number;
    showChartComponent: boolean;
    loadingChart: boolean;
    selectedHeaderTabContent: string;
    selectedHeaderTabId: string;
    selectedSidebarTabId: string;
    sidebarVisible: boolean;
    showGridTools: boolean;
    playbackProgress: number;
    selectedDataSeriesChartMapping: string;
    selectedDataSeriesAudioMapping: string;
    expandedGlobalAudioBasicAccordionItem: boolean;
    expandedGlobalAudioDefaultsAccordionItem: boolean;
    expandedGlobalAudioContextsAccordionItem: boolean;
    // Accordion item name -> expanded
    expandedSeriesAudioAccordionItems: Record<string, boolean>;
    expandedChartMappingsAccordionItems: Record<string, boolean>;
}

export const useViewStore = defineStore('view', {
    state: (): ViewState => ({
        // Reactive dependencies, see ChartBridge.reactiveGet()
        reactToParameterUpdates: 0,
        reactToDataUpdates: 0,

        // Also reactive-related, used to force recreating the entire chart
        showChartComponent: true,

        // Normal view state parameters
        loadingChart: false,
        selectedHeaderTabContent: 'chartContent',
        selectedHeaderTabId: 'Chart',
        selectedSidebarTabId: 'Visual',
        sidebarVisible: true,
        showGridTools: false,
        playbackProgress: 0,
        selectedDataSeriesChartMapping: '',
        selectedDataSeriesAudioMapping: '',
        expandedGlobalAudioBasicAccordionItem: true,
        expandedGlobalAudioDefaultsAccordionItem: false,
        expandedGlobalAudioContextsAccordionItem: false,
        expandedSeriesAudioAccordionItems: {
            Instrument: true
        },
        expandedChartMappingsAccordionItems: {
            Basic: true
        }
    }),

    actions: {
        selectHeaderTab(payload: SelectHeaderTabPayload) {
            this.selectedHeaderTabId = payload.selectedTabId;
            this.selectedHeaderTabContent = payload.contentId;
        },

        selectSidebarTab(selectedTab: string) {
            this.selectedSidebarTabId = selectedTab;
        },

        setPlaybackProgress(progressPct: number) {
            this.playbackProgress = progressPct;
        },

        setSelectedDataSeriesChartMapping(seriesId: string) {
            this.selectedDataSeriesChartMapping = seriesId;
        },

        setSelectedDataSeriesAudioMapping(seriesId: string) {
            this.selectedDataSeriesAudioMapping = seriesId;
        },

        setSidebarVisible(visible: boolean) {
            this.sidebarVisible = visible;
        },

        setShowChartComponent(show: boolean) {
            this.showChartComponent = show;
        },

        setShowGridTools(show: boolean) {
            this.showGridTools = show;
        },

        setLoadingChart(loading: boolean) {
            this.loadingChart = loading;
        },

        setExpandedSeriesAudioAccordionItem(payload: ExpandedAccordionItemPayload) {
            this.expandedSeriesAudioAccordionItems[payload.itemName] = payload.expanded;
        },

        setExpandedChartMappingsAccordionItem(payload: ExpandedAccordionItemPayload) {
            this.expandedChartMappingsAccordionItems[payload.itemName] = payload.expanded;
        },

        setExpandedGlobalAudioBasicAccordionItem(selected: boolean) {
            this.expandedGlobalAudioBasicAccordionItem = selected;
        },

        setExpandedGlobalAudioDefaultsAccordionItem(selected: boolean) {
            this.expandedGlobalAudioDefaultsAccordionItem = selected;
        },

        setExpandedGlobalAudioContextsAccordionItem(selected: boolean) {
            this.expandedGlobalAudioContextsAccordionItem = selected;
        },

        triggerParameterReactivity() {
            this.reactToParameterUpdates++;
        },

        triggerDataReactivity() {
            this.reactToDataUpdates++;
        }
    }
});
