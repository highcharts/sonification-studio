/*
    Data store for global sonification parameters.
    Kept separate from global chart parameters in order to keep things tidy,
    and avoid having to re-render chart when updates are made to these parameters.
 */

import { GenericObject, firstDefined } from '../../core/utils/objects';

interface AddContextPayload {
    valueRange: number|null;
    inactive: boolean;
}

let idCounter = 1;
const makeDefaultContext = (valueMultiplier: number, valueMultiplierName: string): GenericObject => ({
    valueInterval: 1,
    valueMultiplier,
    valueMultiplierName,
    valueProp: 'x',
    playWhenType: 'always',
    playWhenThreshold: 0,
    playWhenMin: 0,
    playWhenMax: 0,
    instrument: 'chop',
    pitchType: 'fixed',
    pitchMappingProp: 'y',
    pitchMappingValue: 0,
    pitchNote: 60,
    volume: 70,
    noteDuration: 300,
    pan: 50,
    id: idCounter++,
    showDetails: true
});


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
    detail: 15,
    contexts: []
});

export const globalSonifyParametersStore = {
    namespaced: true,

    state: defaultState(),

    mutations: {
        // Apply state or restore to defaults if no state is provided.
        // Add items here if they are to be restored from opening project files
        // or localStorage session restore. Keep backwards compatibility in mind.
        restoreStoreState(state: any, newState?: GenericObject) {
            idCounter = 1;
            const defaultOpts: GenericObject = defaultState();
            [
                'volume', 'playMarkerEnabled', 'minNote', 'maxNote', 'panEnabled', 'panWidth', 'detail',
                'speed', 'order', 'contexts'
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
        },

        removeContext(state: any, id: number) {
            const ix = state.contexts.findIndex((c: GenericObject) => c.id === id);
            if (ix > -1) {
                state.contexts.splice(ix, 1);
            }
        },

        addContext(state: any, payload: AddContextPayload) {
            const bin = [
                [1000 * 60 * 60 * 24 * 365, 'years'],
                [1000 * 60 * 60 * 24 * 30.42, 'months'],
                [1000 * 60 * 60 * 24, 'days'],
                [1000 * 60 * 60, 'hours'],
                [1000 * 60, 'minutes'],
                [1000, 'seconds']
            ].find(([val]) => val as number * 3 < (payload.valueRange || -Infinity));

            state.contexts.push(Object.assign(
                bin ?
                    makeDefaultContext(bin[0] as number, bin[1] as string) :
                    makeDefaultContext(1, 'milliseconds'),
                payload.inactive ? { playWhenType: 'never' } : {}
            ));
        }
    }
};
