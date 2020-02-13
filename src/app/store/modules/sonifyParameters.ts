
export const sonifyParametersStore = {
    namespaced: true,

    state: {
        volume: 50
    },

    mutations: {
        setVolume(state: any, volume: number) {
            state.volume = volume;
        }
    }
};
