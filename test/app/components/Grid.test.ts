import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, type Pinia } from 'pinia';
import type * as GridPro from '@highcharts/grid-pro/grid-pro';
import Grid from '../../../src/app/editor/components/Grid.vue';
import { getGridColumnIds } from '../../../src/app/editor/core/utils/gridData';
import { useDataStore } from '../../../src/app/editor/store/modules/data';

interface GridVM {
    renderGrid(): void;
    gridRendered: Promise<void>;
    gridInstance: GridPro.Grid | null;
}

describe('Grid.vue', () => {
    let pinia: Pinia;
    let wrapper: VueWrapper | undefined;

    beforeEach(() => {
        pinia = createPinia();
        // jsdom has no ResizeObserver, which Grid Pro needs
        vi.stubGlobal('ResizeObserver', class {
            observe() {}
            unobserve() {}
            disconnect() {}
        });
        // Without a Grid Key, Grid Pro warns
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = void 0;
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    // Mount the grid and render it, as it is when the Data tab is first
    // shown (which jsdom's lack of layout does not tell), then wait until
    // it has rendered
    async function mountGrid() {
        wrapper = mount(Grid, { attachTo: document.body, global: { plugins: [pinia] } });
        const vm = wrapper.vm as unknown as GridVM;
        vm.renderGrid();
        await vm.gridRendered;
        await flushPromises();
        return wrapper;
    }

    // The workaround for Grid Pro 3.2 setting aria-rowcount without the
    // header rows when it renders (gridProSetup.ts)
    test('Counts the header rows in aria-rowcount from the first render', async () => {
        // A CSV header row and 8 rows: the grid shows the column ids and the
        // CSV headers as header rows
        useDataStore(pinia).setTableRowData([
            { A: 'Index', B: 'Value' },
            ...[10, 30, 20, 40, 15, 35, 25, 5].map((value, i) => ({ A: '' + i, B: '' + value }))
        ]);

        const table = (await mountGrid()).find('table');

        expect(table.attributes('aria-rowcount')).toBe('10');
        // The body rows rendered come after the 2 header rows
        const rows = table.findAll('tbody tr');
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
            expect(Number(row.attributes('aria-rowindex')))
                .toBe(Number(row.attributes('data-row-index')) + 3);
        }
    });

    // Type a value into the cell of a column in the nth row shown (or the
    // first row rendered), and submit it, as a user would. jsdom has no
    // layout, so with row virtualization only one row is rendered.
    async function typeInCell(rowIndex: number | undefined, columnId: string, text: string) {
        const vm = wrapper?.vm as unknown as GridVM;
        const viewport = vm.gridInstance?.viewport;
        const row = rowIndex === void 0 ? viewport?.rows[0] : viewport?.rows.find((r) => r.index === rowIndex);
        const cell = row?.cells
            .find((rowCell) => rowCell.column?.id === columnId) as GridPro.TableCell | undefined;
        if (!cell) {
            throw new Error('No cell');
        }
        viewport?.cellEditing?.startEditing(cell);
        const input = viewport?.cellEditing?.editModeContent?.getMainElement();
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('No cell editor');
        }
        input.value = text;
        viewport?.cellEditing?.stopEditing();
        // The grid writes the value asynchronously, then adds columns if
        // needed
        await vi.waitFor(() => expect(viewport?.cellEditing?.editedCell).toBeUndefined());
        await vm.gridRendered;
        await flushPromises();
    }

    test('Adds columns after an edit in the empty columns after the data', async () => {
        const data = useDataStore(pinia);
        data.setTableRowData([{ A: 'Index', B: 'Value' }, { A: '0', B: '10' }, { A: '1', B: '20' }]);
        const grid = await mountGrid();
        const vm = grid.vm as unknown as GridVM;
        const columnIds = () => vm.gridInstance?.viewport?.columns.map((column) => column.id);
        // The column counts the grid has reported (for the Fill dropdown)
        const countsReported = () => grid.emitted('columnCountChange')?.map(([count]) => count);
        expect(columnIds()).toEqual(getGridColumnIds(11));
        expect(countsReported()).toEqual([11]);

        // An edit in the first five columns after the data adds none
        await typeInCell(1, 'C', '1');
        expect(columnIds()).toEqual(getGridColumnIds(11));

        // An edit in the last column adds five, with the data from the store
        await typeInCell(1, 'K', '5');
        expect(data.tableRowData[2]).toEqual({ A: '1', B: '20', C: '1', K: '5' });
        expect(columnIds()).toEqual(getGridColumnIds(16));
        expect(countsReported()).toEqual([11, 16]);
        expect(grid.findAll('tbody tr[data-row-index="1"] td').map((td) => td.attributes('data-value')))
            .toEqual(['1', '20', '1', '', '', '', '', '', '', '', '5', '', '', '', '', '']);

        // The edits after it are written to the store too
        await typeInCell(1, 'P', '7');
        expect(data.tableRowData[2]).toEqual({ A: '1', B: '20', C: '1', K: '5', P: '7' });
        expect(columnIds()).toEqual(getGridColumnIds(21));
        expect(countsReported()).toEqual([11, 16, 21]);

        // Deleting the value keeps the columns, until the grid is rebuilt
        await typeInCell(1, 'P', '');
        expect(data.tableRowData[2]).toEqual({ A: '1', B: '20', C: '1', K: '5', P: '' });
        expect(columnIds()).toEqual(getGridColumnIds(21));
        expect(countsReported()).toEqual([11, 16, 21]);
    });

    test('Keeps the sorting and the filtering when adding columns', async () => {
        const data = useDataStore(pinia);
        data.setTableRowData([
            { A: 'Index', B: 'Value' },
            ...[10, 30, 20, 40].map((value, i) => ({ A: '' + i, B: '' + value }))
        ]);
        const vm = (await mountGrid()).vm as unknown as GridVM;
        const gridInstance = vm.gridInstance as GridPro.Grid;
        await gridInstance.setSorting([{ columnId: 'B', order: 'desc' }]);
        await gridInstance.viewport?.getColumn('B')?.filtering?.set('15', 'greaterThan');
        // The values of column B in the rows shown
        const shownValues = () => {
            const table = gridInstance.dataProvider && 'getDataTable' in gridInstance.dataProvider ?
                gridInstance.dataProvider.getDataTable(true) :
                void 0;
            return table?.getColumn('B');
        };
        expect(shownValues()).toEqual(['40', '30', '20']);

        await typeInCell(void 0, 'K', '5');
        expect(data.tableRowData.filter((row) => row.K === '5')).toHaveLength(1);
        expect(gridInstance.viewport?.columns).toHaveLength(16);
        expect(shownValues()).toEqual(['40', '30', '20']);
    });
});
