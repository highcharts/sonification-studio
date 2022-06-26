/*
    Data store for global sonification parameters.
    Kept separate from global chart parameters in order to keep things tidy,
    and avoid having to re-render chart when updates are made to these parameters.
 */

import { GenericObject, firstDefined } from '../../core/utils/objects';

const defaultState = () => ({
    volume: 60,
    playbackOpts: {
        // These are grouped because we have to update our interpretation of speed whenever order changes.
        // This way they are mapped to options together.
        speed: 70,
        order: 'simultaneous',
        duration: 12000 // Computed when setting speed
    },
    playMarkerEnabled: true,
    tooltipMarkerEnabled: false,
    minNote: 22,
    maxNote: 96,
    panEnabled: true,
    panWidth: 100,
    detail: 8
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
            ['volume', 'playMarkerEnabled', 'minNote', 'maxNote', 'panEnabled', 'panWidth', 'detail'].forEach(
                x => state[x] = newState ? firstDefined(newState[x], state[x]) : defaultOpts[x]);
            ['speed', 'order', 'duration'].forEach(
                x => state.playbackOpts[x] = newState ? firstDefined(newState.playbackOpts[x], state.playbackOpts[x]) :
                    defaultOpts.playbackOpts[x]);
        },

        setVolume(state: any, volume: number) {
            state.volume = volume;
        },

        setDetail(state: any, detail: number) {
            state.detail = detail;
        },

        setSpeed(state: any, speed: number) {
            state.playbackOpts.speed = speed;
            state.playbackOpts.duration =
                Math.round(1 / Math.pow(speed, 0.4 * speed / 100 + 0.4) * 320000 - 6000);
        },

        setPlayMarkerEnabled(state: any, enabled: boolean) {
            state.playMarkerEnabled = enabled;
        },

        setTooltipMarkerEnabled(state: any, enabled: boolean) {
            state.tooltipMarkerEnabled = enabled;
        },

        setOrder(state: any, order: string) {
            state.playbackOpts.order = order;
        },

        setMinNote(state: any, note: number) {
            state.minNote = note;
        },

        setMaxNote(state: any, note: number) {
            state.maxNote = note;
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
