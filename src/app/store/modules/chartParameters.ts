
export const chartParametersStore = {
    namespaced: true,

    state: {
        type: 'spline',
        legendEnabled: false
    },

    mutations: {
        setType(state: any, type: string) {
            state.type = type;
        },

        setLegendEnabled(state: any, enabled: boolean) {
            state.legendEnabled = enabled;
        }
    }
};
