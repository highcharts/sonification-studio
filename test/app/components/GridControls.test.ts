import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import GridControls from '../../../src/app/editor/components/GridControls.vue';
import { useDataStore } from '../../../src/app/editor/store/modules/data';

describe('GridControls.vue', () => {
    let wrapper: VueWrapper;
    const announce = vi.fn();

    const clearGridButton = () => wrapper.findAll('button').find(b => b.text() === 'Clear Grid');

    const fillColumn = async (column: string, equation: string) => {
        await wrapper.find('#data-fillcolumn-drop').setValue(column);
        await wrapper.find('.equation-input').setValue(equation);
        await wrapper.find('button[aria-label="Fill column"]').trigger('click');
    };

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

    describe('Fill column from equation', () => {
        test('Has help text without markup, with the values "2 * i" fills in', () => {
            // SEControl renders the help text as text, a paragraph for each <br>
            const paragraphs = wrapper.findAll('.helptext-content-container p').map(p => p.text());
            expect(paragraphs).toHaveLength(4);
            paragraphs.forEach(text => expect(text).not.toMatch(/[<>&]/));
            expect(paragraphs[2]).toBe('Use "i" to refer to the row number. Example: "2 * i" will fill in the values 2, 4, 6, 8 etc.');
            expect(paragraphs[3]).toContain('"Expression syntax" (mathjs.org/docs/expressions/syntax.html)');
        });

        test('Announces the first filled values, not the empty header row', async () => {
            // A cleared grid: the header row has no value in the column
            useDataStore().setTableRowData(Array.from(Array(10), () => ({})));

            await fillColumn('C', '2 * i');

            expect(useDataStore().column('C').slice(0, 4)).toEqual([null, '2', '4', '6']);
            expect(announce).toHaveBeenCalledExactlyOnceWith('Column C filled. First values are 2, 4, 6, 8, 10.');
        });

        test('Leaves the column header out of the announcement', async () => {
            // The placeholder data's column B header is "Sensor Data (Y value)"
            await fillColumn('B', 'i');

            expect(useDataStore().column('B')[0]).toBe('Sensor Data (Y value)');
            expect(announce).toHaveBeenCalledExactlyOnceWith('Column B filled. First values are 1, 2, 3, 4, 5.');
        });

        test('Announces fewer values for a short column, and none without rows to fill', async () => {
            const data = useDataStore();
            data.setTableRowData([{ A: 'Header' }, {}, {}]);
            await fillColumn('A', 'i * 3');
            expect(announce).toHaveBeenLastCalledWith('Column A filled. First values are 3, 6.');

            data.setTableRowData([{ A: 'Header' }]);
            await fillColumn('A', 'i * 3');
            expect(announce).toHaveBeenLastCalledWith('Column A filled.');
        });
    });
});
