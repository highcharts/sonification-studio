
export const chartParametersStore = {
    namespaced: true,

    state: {
        type: 'line'
    },

    mutations: {
        setType(state: any, type: string) {
            state.type = type;
        }
    }
};
