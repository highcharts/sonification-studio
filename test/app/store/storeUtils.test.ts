import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSeriesParametersStore } from '../../../src/app/editor/store/modules/seriesParameters';
import { getSeriesParameter, setSeriesParameter } from '../../../src/app/editor/store/storeUtils';

describe('storeUtils', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('getSeriesParameter', () => {
        test('Returns the default for an unknown series or parameter, or no series', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 1 });
            expect(getSeriesParameter('other', 'a', 'default')).toBe('default');
            expect(getSeriesParameter('s', 'b', 'default')).toBe('default');
            expect(getSeriesParameter('', 'a', 'default')).toBe('default');
        });

        test('Returns the parameter of the series', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({ seriesId: 's1', parameterName: 'seriesColor', parameterValue: '#f00' });
            store.setSeriesParameter({ seriesId: 's2', parameterName: 'seriesColor', parameterValue: '#00f' });
            expect(getSeriesParameter('s1', 'seriesColor', '#fff')).toBe('#f00');
            expect(getSeriesParameter('s2', 'seriesColor', '#fff')).toBe('#00f');
        });

        test('Returns the default for null and undefined, but keeps other falsy values', () => {
            const store = useSeriesParametersStore();
            const set = (parameterName: string, parameterValue: unknown) =>
                store.setSeriesParameter({ seriesId: 's', parameterName, parameterValue });
            set('nullParam', null);
            set('undefinedParam', undefined);
            set('zero', 0);
            set('false', false);
            set('empty', '');
            set('nan', NaN);
            expect(getSeriesParameter('s', 'nullParam', 'default')).toBe('default');
            expect(getSeriesParameter('s', 'undefinedParam', 'default')).toBe('default');
            expect(getSeriesParameter('s', 'zero', 50)).toBe(0);
            expect(getSeriesParameter('s', 'false', true)).toBe(false);
            expect(getSeriesParameter('s', 'empty', 'default')).toBe('');
            expect(getSeriesParameter('s', 'nan', 50)).toBeNaN();
        });

        test('Reads parameters nested under a parent', () => {
            const store = useSeriesParametersStore();
            store.setSeriesParameter({
                seriesId: 's', parameterName: 'min', parameterValue: 0, nestedUnderParent: 'pitchOptions'
            });
            store.setSeriesParameter({ seriesId: 's', parameterName: 'max', parameterValue: 80 });
            expect(getSeriesParameter('s', 'min', 10, 'pitchOptions')).toBe(0);
            // Not mixed up with parameters directly under the series or other parents
            expect(getSeriesParameter('s', 'max', 100, 'pitchOptions')).toBe(100);
            expect(getSeriesParameter('s', 'min', 10)).toBe(10);
            expect(getSeriesParameter('s', 'min', 10, 'volumeOptions')).toBe(10);
        });

        test('Returns a falsy parent that is not an object, as before', () => {
            useSeriesParametersStore().restoreStoreState({
                seriesParameters: { s: { emptyParent: '', nullParent: null } }
            });
            expect(getSeriesParameter('s', 'min', 10, 'emptyParent')).toBe('');
            expect(getSeriesParameter('s', 'min', 10, 'nullParent')).toBe(10);
        });

        test('Follows store changes', () => {
            const store = useSeriesParametersStore();
            expect(getSeriesParameter('s', 'a', 'default')).toBe('default');
            store.setSeriesParameter({ seriesId: 's', parameterName: 'a', parameterValue: 'new' });
            expect(getSeriesParameter('s', 'a', 'default')).toBe('new');
            store.clearState();
            expect(getSeriesParameter('s', 'a', 'default')).toBe('default');
        });
    });

    describe('setSeriesParameter', () => {
        test('Sets the parameter of the series through the store action', () => {
            const store = useSeriesParametersStore();
            const actions: Array<[string, unknown[]]> = [];
            store.$onAction(({ name, args }) => {
                actions.push([name, args]);
            });

            setSeriesParameter('s', 'seriesName', 'Name');
            expect(store.seriesParameters).toEqual({ s: { seriesName: 'Name' } });
            expect(actions).toEqual([['setSeriesParameter', [{
                seriesId: 's',
                parameterName: 'seriesName',
                parameterValue: 'Name',
                nestedUnderParent: undefined
            }]]]);
        });

        test('Sets parameters nested under a parent', () => {
            setSeriesParameter('s', 'instrument', 'flute', 'instrument');
            setSeriesParameter('s', 'pitchRoundingEnabled', false, 'instrument');
            setSeriesParameter('s', 'min', 0, 'pitchOptions');
            expect(useSeriesParametersStore().seriesParameters).toEqual({
                s: {
                    instrument: { instrument: 'flute', pitchRoundingEnabled: false },
                    pitchOptions: { min: 0 }
                }
            });
            expect(getSeriesParameter('s', 'pitchRoundingEnabled', true, 'instrument')).toBe(false);
        });

        test('Does nothing without a selected series', () => {
            const store = useSeriesParametersStore();
            let actionCount = 0;
            store.$onAction(() => {
                actionCount++;
            });

            setSeriesParameter('', 'seriesName', 'Name');
            setSeriesParameter('', 'min', 0, 'pitchOptions');
            expect(store.seriesParameters).toEqual({});
            expect(actionCount).toBe(0);
        });
    });
});
