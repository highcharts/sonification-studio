
export const sonifyParametersStore = {
    namespaced: true,

    state: {
        speed: 50,
        volume: 50
    },

    mutations: {
        setSpeed(state: any, speed: number) {
            state.speed = speed;
        },

        setVolume(state: any, volume: number) {
            state.volume = volume;
        }
    }
};
