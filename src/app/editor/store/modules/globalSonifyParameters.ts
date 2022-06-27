/*
    Data store for global sonification parameters.
    Kept separate from global chart parameters in order to keep things tidy,
    and avoid having to re-render chart when updates are made to these parameters.
 */

import { GenericObject, firstDefined } from '../../core/utils/objects';

const defaultState = () => ({
    volume: 70,
    speed: 79,
    order: 'simultaneous',
    playMarkerEnabled: true,
    tooltipMarkerEnabled: false,
    minNote: 36,
    maxNote: 90,
    panEnabled: true,
    panWidth: 100,
    detail: 15
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
            [
                'volume', 'playMarkerEnabled', 'minNote', 'maxNote', 'panEnabled', 'panWidth', 'detail',
                'speed', 'order'
            ].forEach(
                x => state[x] = newState ? firstDefined(newState[x], state[x]) : defaultOpts[x]);
        },

        setVolume(state: any, volume: number) {
            state.volume = volume;
        },

        setDetail(state: any, detail: number) {
            state.detail = detail;
        },

        setSpeed(state: any, speed: number) {
            state.speed = speed;
        },

        setPlayMarkerEnabled(state: any, enabled: boolean) {
            state.playMarkerEnabled = enabled;
        },

        setTooltipMarkerEnabled(state: any, enabled: boolean) {
            state.tooltipMarkerEnabled = enabled;
        },

        setOrder(state: any, order: string) {
            state.order = order;
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
        }
    }
};
