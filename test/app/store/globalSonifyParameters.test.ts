import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
    useGlobalSonifyParametersStore,
    type SonifyContext
} from '../../../src/app/editor/store/modules/globalSonifyParameters';

const defaults = {
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
};

const day = 1000 * 60 * 60 * 24;

describe('globalSonifyParameters store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        // Context ids come from a module-level counter, reset it
        useGlobalSonifyParametersStore().restoreStoreState();
    });

    test('Starts with the default state, keys in order', () => {
        const store = useGlobalSonifyParametersStore();
        expect(store.$state).toEqual(defaults);
        expect(Object.keys(store.$state)).toEqual(Object.keys(defaults));
    });

    test('Setters set their parameter', () => {
        const store = useGlobalSonifyParametersStore();
        store.setVolume(10);
        store.setDetail(20);
        store.setSpeed(30);
        store.setPlayMarkerEnabled(false);
        store.setTooltipMarkerEnabled(true);
        store.setOrder('sequential');
        store.setMinNote(40);
        store.setMaxNote(50);
        store.setPanEnabled(false);
        store.setPanWidth(60);
        expect(store.$state).toEqual({
            volume: 10,
            speed: 30,
            order: 'sequential',
            playMarkerEnabled: false,
            tooltipMarkerEnabled: true,
            minNote: 40,
            maxNote: 50,
            panEnabled: false,
            panWidth: 60,
            detail: 20,
            contexts: []
        });
    });

    describe('restoreStoreState', () => {
        test('Restores the listed keys, but not tooltipMarkerEnabled', () => {
            const store = useGlobalSonifyParametersStore();
            const contexts = [{ id: 1 } as SonifyContext];
            store.restoreStoreState({
                volume: 1,
                speed: 2,
                order: 'sequential',
                playMarkerEnabled: false,
                tooltipMarkerEnabled: true,
                minNote: 3,
                maxNote: 4,
                panEnabled: false,
                panWidth: 5,
                detail: 6,
                contexts
            });
            expect(store.$state).toEqual({
                volume: 1,
                speed: 2,
                order: 'sequential',
                playMarkerEnabled: false,
                tooltipMarkerEnabled: false,
                minNote: 3,
                maxNote: 4,
                panEnabled: false,
                panWidth: 5,
                detail: 6,
                contexts
            });
        });

        test('Keeps current values for keys missing in the new state', () => {
            const store = useGlobalSonifyParametersStore();
            store.setSpeed(50);
            store.setDetail(5);
            store.restoreStoreState({ volume: 0, detail: undefined });
            expect(store.$state).toEqual({ ...defaults, volume: 0, speed: 50, detail: 5 });
        });

        test('Resets to the defaults without a new state, except tooltipMarkerEnabled', () => {
            const store = useGlobalSonifyParametersStore();
            store.setVolume(10);
            store.setOrder('sequential');
            store.setTooltipMarkerEnabled(true);
            store.addContext({ valueRange: null, inactive: false });
            store.restoreStoreState();
            expect(store.$state).toEqual({ ...defaults, tooltipMarkerEnabled: true });
        });
    });

    describe('addContext', () => {
        test('Adds a default context with a millisecond interval without a value range', () => {
            const store = useGlobalSonifyParametersStore();
            store.addContext({ valueRange: null, inactive: false });
            expect(store.contexts).toEqual([{
                valueInterval: 1,
                valueMultiplier: 1,
                valueMultiplierName: 'milliseconds',
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
                id: 1,
                showDetails: true
            }]);
        });

        test('Picks the largest time bin that fits more than 3 times into the value range', () => {
            const store = useGlobalSonifyParametersStore();
            const ranges = [
                day * 365 * 3 + 1,
                day * 365 * 3,
                day * 30.42 * 3,
                day * 3 + 1,
                1000 * 60 * 60 * 3 + 1,
                1000 * 60 * 3 + 1,
                3001,
                3000,
                0
            ];
            ranges.forEach(valueRange => store.addContext({ valueRange, inactive: false }));
            expect(store.contexts.map(c => [c.valueMultiplier, c.valueMultiplierName])).toEqual([
                [day * 365, 'years'],
                [day * 30.42, 'months'],
                [day, 'days'],
                [day, 'days'],
                [1000 * 60 * 60, 'hours'],
                [1000 * 60, 'minutes'],
                [1000, 'seconds'],
                [1, 'milliseconds'],
                [1, 'milliseconds']
            ]);
        });

        test('Adds an inactive context that never plays', () => {
            const store = useGlobalSonifyParametersStore();
            store.addContext({ valueRange: null, inactive: true });
            expect(store.contexts[0].playWhenType).toBe('never');
        });

        test('Gives contexts increasing ids, starting over after a reset', () => {
            const store = useGlobalSonifyParametersStore();
            store.addContext({ valueRange: null, inactive: false });
            store.addContext({ valueRange: null, inactive: false });
            expect(store.contexts.map(c => c.id)).toEqual([1, 2]);

            store.restoreStoreState();
            store.addContext({ valueRange: null, inactive: false });
            expect(store.contexts.map(c => c.id)).toEqual([1]);
        });
    });

    test('Continues context ids after the highest restored one', () => {
        const store = useGlobalSonifyParametersStore();
        store.restoreStoreState({
            contexts: [{ id: 3 } as SonifyContext, { id: 1 } as SonifyContext]
        });
        store.addContext({ valueRange: null, inactive: false });
        expect(store.contexts.map(c => c.id)).toEqual([3, 1, 4]);

        // Removing the new context leaves the restored ones
        store.removeContext(4);
        expect(store.contexts.map(c => c.id)).toEqual([3, 1]);

        // A restore without contexts keeps the current ones and their numbering
        store.restoreStoreState({ volume: 10 });
        store.addContext({ valueRange: null, inactive: false });
        expect(store.contexts.map(c => c.id)).toEqual([3, 1, 4]);
    });

    test('removeContext removes the context with the id, and ignores unknown ids', () => {
        const store = useGlobalSonifyParametersStore();
        store.addContext({ valueRange: null, inactive: false });
        store.addContext({ valueRange: null, inactive: false });
        store.addContext({ valueRange: null, inactive: false });
        store.removeContext(2);
        expect(store.contexts.map(c => c.id)).toEqual([1, 3]);
        store.removeContext(7);
        expect(store.contexts.map(c => c.id)).toEqual([1, 3]);
        store.addContext({ valueRange: null, inactive: false });
        expect(store.contexts.map(c => c.id)).toEqual([1, 3, 4]);
    });
});
