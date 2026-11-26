import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import GridControls from '../../../src/app/editor/components/GridControls.vue';
import { useDataStore } from '../../../src/app/editor/store/modules/data';

describe('GridControls.vue', () => {
    let wrapper: VueWrapper;
    const announce = vi.fn();

    const clearGridButton = () => wrapper.findAll('button').find(b => b.text() === 'Clear Grid');

    beforeEach(() => {
        vi.useFakeTimers();
        const pinia = createPinia();
        setActivePinia(pinia);
        useDataStore().setToPlaceholderData();
        wrapper = mount(GridControls, {
            global: {
                plugins: [pinia],
                mocks: { $announcer: { announce } }
            }
        });
    });

    afterEach(() => {
        wrapper.unmount();
        vi.useRealTimers();
        vi.restoreAllMocks();
        announce.mockClear();
    });

    test('Clears the grid to ten empty rows and announces it', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        await clearGridButton()?.trigger('click');

        const data = useDataStore();
        expect(data.tableRowData).toStrictEqual(Array.from(Array(10), () => ({})));
        expect(data.tableRowData.some(row => Array.isArray(row))).toBe(false);
        expect(data.tableCSV).toBe('\n'.repeat(9));
        expect(data.numCols).toBe(0);
        expect(data.tableColumnNamesWithData).toEqual([]);

        expect(announce).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect(announce).toHaveBeenCalledWith('Data table cleared.');
    });

    test('Keeps the data when clearing is not confirmed', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        await clearGridButton()?.trigger('click');
        vi.advanceTimersByTime(500);

        expect(useDataStore().tableRowData).toHaveLength(200);
        expect(announce).not.toHaveBeenCalled();
    });
});
