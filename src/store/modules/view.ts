
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
        selectedDataSeries: ''
    },

    mutations: {
        selectHeaderTab(state: any, payload: SelectHeaderTabPayload) {
            state.selectedHeaderTabId = payload.selectedTabId;
            state.selectedHeaderTabContent = payload.contentId;
        },

        setPlaybackProgress(state: any, progressPct: number) {
            state.playbackProgress = progressPct;
        },

        setSelectedDataSeries(state: any, seriesId: string) {
            state.selectedDataSeries = seriesId;
        },

        triggerParameterReactivity(state: any) {
            state.reactToParameterUpdates++;
        },

        triggerDataReactivity(state: any) {
            state.reactToDataUpdates++;
        }
    }
};
