
interface SelectHeaderTabPayload {
    selectedTabId: string;
    contentId: string;
}

export const viewStore = {
    namespaced: true,

    state: {
        selectedHeaderTabId: 'Data',
        selectedHeaderTabContent: 'dataContent'
    },

    mutations: {
        selectHeaderTab(state: any, payload: SelectHeaderTabPayload) {
            state.selectedHeaderTabId = payload.selectedTabId;
            state.selectedHeaderTabContent = payload.contentId;
        }
    }
};
