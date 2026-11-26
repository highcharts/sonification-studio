/*
    The data grid's options in a Grid Pro grid rendered in jsdom: cell edits
    written back to the store's rows as Grid.vue does, number cells and CSV
    headers.
*/

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as GridPro from '@highcharts/grid-pro/grid-pro';
import '../../src/app/editor/core/gridProSetup';
import {
    applyCellEdit,
    clearableNumberInputType,
    getGridDataTable,
    getGridOptions,
    onGridCellEdit,
    prepareGridData,
    type CellEdit,
    type GridTableData,
    type TableRowData
} from '../../src/app/editor/core/utils/gridData';

type ColumnOptions = NonNullable<GridPro.Options['columns']>[number];

// A CSV header row, then 8 rows, so that both columns are detected as numbers
function getRows(): TableRowData[] {
    const values = [10, 30, 20, 40, 15, 35, 25, 5];
    return [
        { A: 'Index', B: 'Value' },
        ...values.map((value, i) => ({ A: '' + i, B: '' + value }))
    ];
}

let grid: GridPro.Grid | undefined;

// Render a grid with the app's options for the data, with changes to some
// columns' options
async function renderGrid(
    data: GridTableData,
    columnChanges: Record<string, Partial<ColumnOptions>> = {}
): Promise<GridPro.Grid> {
    const options = getGridOptions(data);
    options.columns = options.columns?.map((column) => ({
        ...column,
        ...columnChanges[column.id]
    }));
    // jsdom has no layout, so with row virtualization only one row would be
    // rendered
    options.rendering = {
        ...options.rendering,
        rows: { ...options.rendering?.rows, virtualization: false }
    };
    const container = document.createElement('div');
    document.body.appendChild(container);
    return new Promise((resolve) => {
        grid = new GridPro.Grid(container, options, resolve);
    });
}

// The grid's original (not sorted or filtered) data table
function getDataTable(gridWithTable: GridPro.Grid): GridPro.DataTable {
    const dataTable = getGridDataTable(gridWithTable);
    if (!dataTable) {
        throw new Error('No data table');
    }
    return dataTable;
}

// Watch the grid's cell edits, as Grid.vue does
function watchEdits(gridToWatch: GridPro.Grid, data: GridTableData): CellEdit[] {
    const edits: CellEdit[] = [];
    onGridCellEdit(getDataTable(gridToWatch), data.firstDataRowIndex, (edit) => edits.push(edit));
    return edits;
}

// The cell of a column in the nth row shown
function getShownCell(gridWithCell: GridPro.Grid, rowIndex: number, columnId: string): GridPro.TableCell {
    const cell = gridWithCell.viewport?.rows.find((row) => row.index === rowIndex)?.cells
        .find((rowCell) => rowCell.column?.id === columnId);
    if (!cell) {
        throw new Error('No cell');
    }
    return cell as GridPro.TableCell;
}

// Type a value into a cell's editor and submit it, as a user would
async function typeInCell(gridWithCell: GridPro.Grid, cell: GridPro.TableCell, text: string) {
    const cellEditing = gridWithCell.viewport?.cellEditing;
    cellEditing?.startEditing(cell);
    const input = cellEditing?.editModeContent?.getMainElement();
    if (!(input instanceof HTMLInputElement)) {
        throw new Error('No cell editor');
    }
    input.value = text;
    cellEditing?.stopEditing();
    // The grid writes the value asynchronously
    await vi.waitFor(() => expect(cellEditing?.editedCell).toBeUndefined());
}

beforeEach(() => {
    // jsdom has no ResizeObserver, which Grid Pro needs
    vi.stubGlobal('ResizeObserver', class {
        observe() {}
        unobserve() {}
        disconnect() {}
    });
    // Grid Pro warns about the missing Grid Key
    const warn = console.warn;
    vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
        if (!String(args[0]).includes('Grid Key')) {
            warn(...args);
        }
    });
});

afterEach(() => {
    grid?.destroy();
    grid = void 0;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('Edits in a sorted or filtered grid', () => {
    test('Go to the edited row while sorted', async () => {
        const rows = getRows();
        const data = prepareGridData(rows);
        const sortedGrid = await renderGrid(data, {
            B: { sorting: { enabled: true, order: 'desc' } }
        });
        const edits = watchEdits(sortedGrid, data);

        // The first row shown is the one with the highest value, 40, which
        // is the 4th data row: store row 4 after the header row.
        const cell = getShownCell(sortedGrid, 0, 'B');
        expect(cell.value).toEqual(40);
        await cell.editValue(1);

        expect(edits).toEqual([{ rowIndex: 4, columnId: 'B', value: '1' }]);
        const newRows = applyCellEdit(rows, edits[0], data.columnIds);
        expect(newRows.map((row) => row.B)).toEqual(
            ['Value', '10', '30', '20', '1', '15', '35', '25', '5']
        );
    });

    test('Go to the edited row while filtered', async () => {
        const data = prepareGridData(getRows());
        const filteredGrid = await renderGrid(data, {
            A: { filtering: { enabled: true, condition: 'greaterThan', value: 5 } }
        });
        const edits = watchEdits(filteredGrid, data);

        // Rows 6 and 7 are shown; row 6 is filtered out by the edit
        const cell = getShownCell(filteredGrid, 0, 'A');
        expect(cell.value).toEqual(6);
        await typeInCell(filteredGrid, cell, '0');

        expect(edits).toEqual([{ rowIndex: 7, columnId: 'A', value: '0' }]);
    });

    test('Ignore changes that are not edits in the grid', async () => {
        const data = prepareGridData(getRows());
        const dataTable = getDataTable(await renderGrid(data));
        const edits: CellEdit[] = [];
        const stop = onGridCellEdit(dataTable, 1, (edit) => edits.push(edit));

        dataTable.setCell('B', 0, 1);
        stop();
        dataTable.setCell('B', 1, 2, { fromGrid: true });
        expect(edits).toEqual([]);
    });
});

describe('Number cells', () => {
    test('Stay empty when cleared', async () => {
        const data = prepareGridData(getRows());
        expect(data.dataTypes.B).toEqual('number');
        const numberGrid = await renderGrid(data);
        const edits = watchEdits(numberGrid, data);

        await typeInCell(numberGrid, getShownCell(numberGrid, 1, 'B'), '');
        await typeInCell(numberGrid, getShownCell(numberGrid, 2, 'B'), '0');
        await typeInCell(numberGrid, getShownCell(numberGrid, 3, 'B'), '-2.5');

        expect(edits).toEqual([
            { rowIndex: 2, columnId: 'B', value: '' },
            { rowIndex: 3, columnId: 'B', value: '0' },
            { rowIndex: 4, columnId: 'B', value: '-2.5' }
        ]);
        expect(getShownCell(numberGrid, 1, 'B').value).toEqual('');
        expect(getShownCell(numberGrid, 2, 'B').value).toEqual(0);
    });

    test('Leave Grid Pro\'s own number input as it is', () => {
        const { types, registerRenderer } = GridPro.CellRendererRegistry;
        expect(types[clearableNumberInputType]).toBeDefined();
        expect(types.numberInput).not.toBe(types[clearableNumberInputType]);
        // A second registration (on a hot reload) does nothing
        expect(registerRenderer(clearableNumberInputType, types[clearableNumberInputType])).toBe(false);
    });
});

describe('CSV headers', () => {
    test('Are shown as written', async () => {
        const headers = ['Cost {USD}', 'a <b>bold</b> & c', 'R&D'];
        const rows: TableRowData[] = [
            { A: headers[0], B: headers[1], C: headers[2] },
            { A: '1', B: '2', C: '3' }
        ];
        const headerGrid = await renderGrid(prepareGridData(rows));

        ['A', 'B', 'C'].forEach((id, i) => {
            const headerCell = headerGrid.viewport?.getColumn(id)?.header;
            // As shown, and in the sorting and filtering popups
            expect(headerCell?.htmlElement.textContent?.trim()).toEqual(headers[i]);
            expect(headerCell?.value).toEqual(headers[i]);
            // Labelled with the column id, described by the CSV header
            expect(headerCell?.htmlElement.getAttribute('aria-label')).toEqual(id);
            expect(headerCell?.htmlElement.getAttribute('aria-description')).toEqual(headers[i]);
        });
        expect(document.querySelector('thead b')).toBeNull();
    });
});
