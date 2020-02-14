
export const sonifyParametersStore = {
    namespaced: true,

    state: {
        speed: 50,
        volume: 50,
        minFrequency: 392, // G4
        maxFrequency: 1319, // G6
        panEnabled: false,
        panWidth: 90
    },

    mutations: {
        setSpeed(state: any, speed: number) {
            state.speed = speed;
        },

        setVolume(state: any, volume: number) {
            state.volume = volume;
        },

        setMinFrequency(state: any, minfreq: number) {
            state.minFrequency = minfreq;
        },

        setMaxFrequency(state: any, maxfreq: number) {
            state.maxFrequency = maxfreq;
        },

        setPanEnabled(state: any, pan: boolean) {
            state.panEnabled = pan;
        },

        setPanWidth(state: any, panWidth: number) {
            state.panWidth = panWidth;
        }
    }
};
