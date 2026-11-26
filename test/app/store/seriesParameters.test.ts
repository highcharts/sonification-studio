import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSeriesParametersStore } from '../../../src/app/editor/store/modules/seriesParameters';

describe('seriesParameters store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('Starts with no series parameters', () => {
        expect(useSeriesParametersStore().$state).toEqual({ seriesParameters: {} });
    });

    describe('setSeriesParameter', () => {
        test('Creates a missing series object and sets the parameter', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({
                seriesId: 'series-1',
                parameterName: 'seriesColor',
                parameterValue: '#ff0000'
            });
            expect(store.seriesParameters).toEqual({
                'series-1': { seriesColor: '#ff0000' }
            });
        });

        test('Adds to and overwrites parameters of an existing series', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 1 });
            store.setSeriesParameter({ seriesId: 's', parameterName: 'b', parameterValue: true });
            store.setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: null });
            expect(store.seriesParameters).toEqual({ s: { a: null, b: true } });
        });

        test('Nests the parameter under a parent, creating the series and the parent', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({
                seriesId: 's',
                parameterName: 'instrument',
                parameterValue: 'flute',
                nestedUnderParent: 'instrument'
            });
            store.setSeriesParameter({
                seriesId: 's',
                parameterName: 'pitchRoundingEnabled',
                parameterValue: true,
                nestedUnderParent: 'instrument'
            });
            store.setSeriesParameter({ seriesId: 's', parameterName: 'seriesName', parameterValue: 'X' });
            expect(store.seriesParameters).toEqual({
                s: {
                    instrument: { instrument: 'flute', pitchRoundingEnabled: true },
                    seriesName: 'X'
                }
            });
        });

        test('Keeps other series untouched', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({ seriesId: 's1', parameterName: 'a', parameterValue: 1 });
            const s1 = store.seriesParameters.s1;
            store.setSeriesParameter({ seriesId: 's2', parameterName: 'a', parameterValue: 2 });
            expect(store.seriesParameters.s1).toBe(s1);
            expect(store.seriesParameters).toEqual({ s1: { a: 1 }, s2: { a: 2 } });
        });
    });

    describe('restoreStoreState', () => {
        test('Deep-merges the new state into a fresh state', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({ seriesId: 'old', parameterName: 'a', parameterValue: 1 });

            const newState = {
                seriesParameters: {
                    s1: {
                        seriesName: 'Name',
                        seriesVisible: false,
                        pitch: { mapTo: 'y', min: null, nested: { deep: 3 } }
                    },
                    s2: { seriesColor: '#000' }
                }
            };
            store.restoreStoreState(newState);

            expect(store.seriesParameters).toEqual(newState.seriesParameters);
            // The old series is gone, and the new state is copied, not referenced
            expect(store.seriesParameters.old).toBeUndefined();
            expect(store.seriesParameters.s1.pitch).not.toBe(newState.seriesParameters.s1.pitch);
            newState.seriesParameters.s1.pitch.nested.deep = 4;
            expect(store.seriesParameters.s1.pitch.nested.deep).toBe(3);
        });

        test('Copies arrays as objects keyed by index, like before', () => {
            const store = useSeriesParametersStore();
            store.restoreStoreState({ seriesParameters: { s: { list: ['a', 'b'] } } });
            expect(store.seriesParameters).toEqual({ s: { list: { 0: 'a', 1: 'b' } } });
        });

        test('Resets to no series parameters without a new state', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 1 });
            store.restoreStoreState();
            expect(store.seriesParameters).toEqual({});
        });
    });

    test('clearState removes all series parameters', () => {
        const store = useSeriesParametersStore();
        store.setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 1 });
        store.clearState();
        expect(store.seriesParameters).toEqual({});
    });
});
