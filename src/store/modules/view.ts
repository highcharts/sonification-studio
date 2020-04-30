/*
    Data store for data that is specific to the app view components, but
    used across multiple components.
*/

interface SelectHeaderTabPayload {
    selectedTabId: string;
    contentId: string;
}

export const viewStore = {
    namespaced: true,

    state: {
        // Reactive dependencies, see ChartBridge.reactiveGet()
        reactToParameterUpdates: 0,
        reactToDataUpdates: 0,

        selectedHeaderTabContent: 'dataContent',
        selectedHeaderTabId: 'Data',
        playbackProgress: 0,
        selectedDataSeriesChartMapping: '',
        selectedDataSeriesAudioMapping: ''
    },

    mutations: {
        selectHeaderTab(state: any, payload: SelectHeaderTabPayload) {
            state.selectedHeaderTabId = payload.selectedTabId;
            state.selectedHeaderTabContent = payload.contentId;
        },

        setPlaybackProgress(state: any, progressPct: number) {
            state.playbackProgress = progressPct;
        },

        setSelectedDataSeriesChartMapping(state: any, seriesId: string) {
            state.selectedDataSeriesChartMapping = seriesId;
        },

        setSelectedDataSeriesAudioMapping(state: any, seriesId: string) {
            state.selectedDataSeriesAudioMapping = seriesId;
        },

        triggerParameterReactivity(state: any) {
            state.reactToParameterUpdates++;
        },

        triggerDataReactivity(state: any) {
            state.reactToDataUpdates++;
        }
    }
};
