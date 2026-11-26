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
        test('Restores every key', () => {
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
                tooltipMarkerEnabled: true,
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
            store.setTooltipMarkerEnabled(true);
            store.restoreStoreState({ volume: 0, detail: undefined });
            expect(store.$state).toEqual({ ...defaults, volume: 0, speed: 50, detail: 5, tooltipMarkerEnabled: true });
        });

        test('Resets to the defaults without a new state', () => {
            const store = useGlobalSonifyParametersStore();
            store.setVolume(10);
            store.setOrder('sequential');
            store.setTooltipMarkerEnabled(true);
            store.addContext({ valueRange: null, inactive: false });
            store.restoreStoreState();
            expect(store.$state).toEqual(defaults);
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

    test('Gives restored contexts with duplicate or invalid ids new ids', () => {
        // As saved by master v1.1.1 after a restore and adding a context
        const store = useGlobalSonifyParametersStore();
        const contexts = [
            { id: 1, volume: 10 },
            { id: 1, volume: 20 },
            { id: 2, volume: 30 },
            { volume: 40 },
            { id: '3', volume: 50 },
            { id: NaN, volume: 60 },
            { id: 2, volume: 70 }
        ] as unknown as SonifyContext[];
        store.restoreStoreState({ contexts });
        // The first context with an id keeps it, later ones are numbered after the highest
        expect(store.contexts.map(c => [c.id, c.volume])).toEqual([
            [1, 10], [3, 20], [2, 30], [4, 40], [5, 50], [6, 60], [7, 70]
        ]);

        store.addContext({ valueRange: null, inactive: false });
        expect(store.contexts[7].id).toBe(8);
    });

    test('Edits and removes the second of duplicate restored contexts by its new id', () => {
        const store = useGlobalSonifyParametersStore();
        store.restoreStoreState({
            contexts: [{ id: 1, volume: 10 }, { id: 1, volume: 20 }] as SonifyContext[]
        });
        expect(store.contexts.map(c => c.id)).toEqual([1, 2]);

        store.setContextParameter({ id: 2, parameterName: 'volume', value: 25 });
        expect(store.contexts.map(c => c.volume)).toEqual([10, 25]);

        store.removeContext(2);
        expect(store.contexts.map(c => [c.id, c.volume])).toEqual([[1, 10]]);
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

    describe('setContextParameter', () => {
        test('Sets the parameter of the context with the id only', () => {
            const store = useGlobalSonifyParametersStore();
            store.addContext({ valueRange: null, inactive: false });
            store.addContext({ valueRange: null, inactive: false });
            const [first, second] = store.contexts.map(c => ({ ...c }));

            store.setContextParameter({ id: 2, parameterName: 'volume', value: 30 });
            store.setContextParameter({ id: 2, parameterName: 'instrument', value: 'flute' });
            store.setContextParameter({ id: 2, parameterName: 'showDetails', value: false });
            expect(store.contexts).toEqual([
                first,
                { ...second, volume: 30, instrument: 'flute', showDetails: false }
            ]);
        });

        test('Sets parameters missing in restored contexts', () => {
            const store = useGlobalSonifyParametersStore();
            store.restoreStoreState({ contexts: [{ id: 5 } as SonifyContext] });
            store.setContextParameter({ id: 5, parameterName: 'valueMultiplierName', value: 'days' });
            expect(store.contexts).toEqual([{ id: 5, valueMultiplierName: 'days' }]);
        });

        test('Ignores unknown ids', () => {
            const store = useGlobalSonifyParametersStore();
            store.addContext({ valueRange: null, inactive: false });
            const context = { ...store.contexts[0] };
            store.setContextParameter({ id: 2, parameterName: 'volume', value: 30 });
            expect(store.contexts).toEqual([context]);
        });

        test('Is an action, so persistence and chart updates see the edit', () => {
            const store = useGlobalSonifyParametersStore();
            store.addContext({ valueRange: null, inactive: false });
            const actions: string[] = [];
            store.$onAction(({ name, after }) => after(() => actions.push(name)));
            store.setContextParameter({ id: 1, parameterName: 'pan', value: 10 });
            expect(actions).toEqual(['setContextParameter']);
        });
    });
});
