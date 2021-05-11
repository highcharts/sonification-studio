/*
    Data store for global sonification parameters.
    Kept separate from global chart parameters in order to keep things tidy,
    and avoid having to re-render chart when updates are made to these parameters.
 */

import { GenericObject, firstDefined } from '../../core/utils/objects';

const defaultState = () => ({
    volume: 30,
    playbackOpts: {
        // These are grouped because we have to update our interpretation of speed whenever order changes.
        // This way they are mapped to options together.
        speed: 50,
        order: 'simultaneous'
    },
    playMarkerEnabled: false,
    minFrequency: 392, // G4
    maxFrequency: 1319, // G6
    panEnabled: false,
    panWidth: 90
});

export const globalSonifyParametersStore = {
    namespaced: true,

    state: defaultState(),

    mutations: {
        // Apply state or restore to defaults if no state is provided.
        // Add items here if they are to be restored from opening project files
        // or localStorage session restore. Keep backwards compatibility in mind.
        restoreStoreState(state: any, newState?: GenericObject) {
            const defaultOpts: GenericObject = defaultState();
            ['volume', 'playMarkerEnabled', 'minFrequency', 'maxFrequency', 'panEnabled', 'panWidth'].forEach(
                x => state[x] = newState ? firstDefined(newState[x], state[x]) : defaultOpts[x]);
            ['speed', 'order'].forEach(
                x => state.playbackOpts[x] = newState ? firstDefined(newState.playbackOpts[x], state.playbackOpts[x]) :
                    defaultOpts.playbackOpts[x]);
        },

        setVolume(state: any, volume: number) {
            state.volume = volume;
        },

        setSpeed(state: any, speed: number) {
            state.playbackOpts.speed = speed;
        },

        setPlayMarkerEnabled(state: any, enabled: boolean) {
            state.playMarkerEnabled = enabled;
        },

        setOrder(state: any, order: string) {
            state.playbackOpts.order = order;
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
        },

        // Monitored by store-subscription, so only called for side effects
        triggerPlaybackOptsRecalculation() {} // eslint-disable-line
    }
};
