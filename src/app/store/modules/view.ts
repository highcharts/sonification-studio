
interface SelectHeaderTabPayload {
    selectedTabId: string;
    contentId: string;
}

export const viewStore = {
    namespaced: true,

    state: {
        // Keep track of number of chart option updates, and create a
        // reactive dependency to trigger the preview to update when
        // the ChartBridge updates.
        chartOptionsUpdateCounter: 0,

        selectedHeaderTabContent: 'dataContent',
        selectedHeaderTabId: 'Data',
        playbackProgress: 0
    },

    mutations: {
        incrementChartOptionsUpdateCounter(state: any) {
            state.chartOptionsUpdateCounter++;
        },

        selectHeaderTab(state: any, payload: SelectHeaderTabPayload) {
            state.selectedHeaderTabId = payload.selectedTabId;
            state.selectedHeaderTabContent = payload.contentId;
        },

        setPlaybackProgress(state: any, progressPct: number) {
            state.playbackProgress = progressPct;
        }
    }
};
