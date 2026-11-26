/*
    Data store for global sonification parameters.
    Kept separate from global chart parameters in order to keep things tidy,
    and avoid having to re-render chart when updates are made to these parameters.
 */

import { defineStore } from 'pinia';
import { firstDefined } from '../../core/utils/objects';

export interface AddContextPayload {
    valueRange: number|null;
    inactive: boolean;
}

// A global audio context cue
export interface SonifyContext {
    valueInterval: number;
    valueMultiplier: number;
    valueMultiplierName: string;
    valueProp: string;
    playWhenType: string;
    playWhenThreshold: number;
    playWhenMin: number;
    playWhenMax: number;
    instrument: string;
    pitchType: string;
    pitchMappingProp: string;
    pitchMappingValue: number;
    pitchNote: number;
    volume: number;
    noteDuration: number;
    pan: number;
    id: number;
    showDetails: boolean;
}

export interface GlobalSonifyParametersState {
    volume: number;
    speed: number;
    order: string;
    playMarkerEnabled: boolean;
    tooltipMarkerEnabled: boolean;
    minNote: number;
    maxNote: number;
    panEnabled: boolean;
    panWidth: number;
    detail: number;
    contexts: SonifyContext[];
}

let idCounter = 1;
const makeDefaultContext = (valueMultiplier: number, valueMultiplierName: string): SonifyContext => ({
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


const defaultState = (): GlobalSonifyParametersState => ({
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

// Set one state value, keeping the value type of the key when looping over keys.
function setStateValue<K extends keyof GlobalSonifyParametersState>(
    state: GlobalSonifyParametersState,
    key: K,
    value: GlobalSonifyParametersState[K]
): void {
    state[key] = value;
}

// Time bins for context intervals on datetime axes: [milliseconds, name]
const contextTimeBins: Array<[number, string]> = [
    [1000 * 60 * 60 * 24 * 365, 'years'],
    [1000 * 60 * 60 * 24 * 30.42, 'months'],
    [1000 * 60 * 60 * 24, 'days'],
    [1000 * 60 * 60, 'hours'],
    [1000 * 60, 'minutes'],
    [1000, 'seconds']
];

export const useGlobalSonifyParametersStore = defineStore('globalSonifyParameters', {
    state: defaultState,

    actions: {
        // Apply state or restore to defaults if no state is provided.
        // Add items here if they are to be restored from opening project files
        // or localStorage session restore. Keep backwards compatibility in mind.
        restoreStoreState(newState?: Partial<GlobalSonifyParametersState>) {
            idCounter = 1;
            const defaultOpts = defaultState();
            const restoredKeys: Array<keyof GlobalSonifyParametersState> = [
                'volume', 'playMarkerEnabled', 'minNote', 'maxNote', 'panEnabled', 'panWidth', 'detail',
                'speed', 'order', 'contexts'
            ];
            restoredKeys.forEach(
                x => setStateValue(this.$state, x, newState ? firstDefined(newState[x], this.$state[x]) : defaultOpts[x]));
        },

        setVolume(volume: number) {
            this.volume = volume;
        },

        setDetail(detail: number) {
            this.detail = detail;
        },

        setSpeed(speed: number) {
            this.speed = speed;
        },

        setPlayMarkerEnabled(enabled: boolean) {
            this.playMarkerEnabled = enabled;
        },

        setTooltipMarkerEnabled(enabled: boolean) {
            this.tooltipMarkerEnabled = enabled;
        },

        setOrder(order: string) {
            this.order = order;
        },

        setMinNote(note: number) {
            this.minNote = note;
        },

        setMaxNote(note: number) {
            this.maxNote = note;
        },

        setPanEnabled(pan: boolean) {
            this.panEnabled = pan;
        },

        setPanWidth(panWidth: number) {
            this.panWidth = panWidth;
        },

        removeContext(id: number) {
            const ix = this.contexts.findIndex(c => c.id === id);
            if (ix > -1) {
                this.contexts.splice(ix, 1);
            }
        },

        addContext(payload: AddContextPayload) {
            const bin = contextTimeBins.find(([val]) => val * 3 < (payload.valueRange || -Infinity));

            this.contexts.push(Object.assign(
                bin ?
                    makeDefaultContext(bin[0], bin[1]) :
                    makeDefaultContext(1, 'milliseconds'),
                payload.inactive ? { playWhenType: 'never' } : {}
            ));
        }
    }
});
