
export const sonifyParametersStore = {
    namespaced: true,

    state: {
        speed: 50,
        volume: 50,
        minimumFrequency: 392, // G4
        maximumFrequency: 1319 // G6
    },

    mutations: {
        setSpeed(state: any, speed: number) {
            state.speed = speed;
        },

        setVolume(state: any, volume: number) {
            state.volume = volume;
        },

        setMinimumFrequency(state: any, minfreq: number) {
            state.minimumFrequency = minfreq;
        },

        setMaximumFrequency(state: any, maxfreq: number) {
            state.maximumFrequency = maxfreq;
        }
    }
};
