import { describe, expect, test, vi } from 'vitest';
import { createPinia } from 'pinia';
import {
    applyCellEdit,
    clearableNumberInputType,
    compareDates,
    detectColumnDataType,
    getCellEditorLabel,
    getColumnId,
    getColumnIndex,
    getGridColumnCount,
    getGridColumnIds,
    getSeriesColumnIds,
    getGridOptions,
    getGridRebuild,
    prepareGridData,
    renameLegacyColumnIds,
    toStoreValue,
    type TableRowData
} from '../../../src/app/editor/core/utils/gridData';
import { useDataStore } from '../../../src/app/editor/store/modules/data';
import { getNavigationTarget } from '../../../src/app/editor/core/gridProSetup';

function getRows(): TableRowData[] {
    return [
        { A: 'Index (X value)', B: 'Sensor Data (Y value)' },
        { A: '0', B: '0.000' },
        { A: '1', B: '0.164' },
        { A: '2', B: '0.618' }
    ];
}

describe('prepareGridData', () => {
    test('Shows the CSV header row as headers, not as data', () => {
        const data = prepareGridData(getRows());
        expect(data.headerRow).toEqual({ A: 'Index (X value)', B: 'Sensor Data (Y value)' });
        expect(data.firstDataRowIndex).toEqual(1);
        expect(data.columns.A).toEqual(['0', '1', '2']);
        expect(data.columnIds).toEqual(getGridColumnIds(11));
        expect(data.columns.K).toEqual(['', '', '']);
    });

    test('Shows the columns getGridColumnCount gives', () => {
        const rows: TableRowData[] = [{ A: 'x' }, { A: '1', M: '2' }];
        expect(prepareGridData(rows).columnIds).toEqual(getGridColumnIds(18));
    });

    test('Converts columns with data to their type', () => {
        const rows: TableRowData[] = [{ A: 'n', B: 'label' }];
        for (let i = 0; i < 10; i++) {
            rows.push({ A: '' + i, B: 'Item ' + i });
        }
        const data = prepareGridData(rows);
        expect(data.dataTypes.A).toEqual('number');
        expect(data.columns.A[0]).toEqual(0);
        expect(data.dataTypes.B).toEqual('string');
        expect(data.headerColumnCount).toEqual(0);
    });
});

describe('Column ids', () => {
    // The rows the store makes from an imported CSV
    function loadFromCSV(csv: string): TableRowData[] {
        const dataStore = useDataStore(createPinia());
        dataStore.loadFromCSV(csv);
        return dataStore.tableRowData;
    }

    test('A to Z, then AA, AB, ..., as in spreadsheets', () => {
        const ids = getGridColumnIds(30);
        expect(ids.slice(0, 3)).toEqual(['A', 'B', 'C']);
        expect(ids.slice(25)).toEqual(['Z', 'AA', 'AB', 'AC', 'AD']);
        expect(getGridColumnIds(50).at(-1)).toEqual('AX');
        expect([51, 52, 701, 702, 18277].map(getColumnId))
            .toEqual(['AZ', 'BA', 'ZZ', 'AAA', 'ZZZ']);
    });

    test('Give the index of each column id, and -1 for other keys', () => {
        for (const index of [0, 25, 26, 51, 52, 701, 702, 18277]) {
            expect(getColumnIndex(getColumnId(index))).toEqual(index);
        }
        for (const key of ['', 'a', 'Aa', 'A1', 'COL1', 'AAAA', '_', 'other']) {
            expect(getColumnIndex(key)).toEqual(-1);
        }
    });

    test('Match the columns of an imported CSV with more than 26 columns', () => {
        const values = Array.from({ length: 30 }, (_, i) => i + 1);
        const rows = loadFromCSV(
            values.map((i) => 'H' + i).join(',') + '\n' + values.join(',')
        );
        expect(Object.keys(rows[1])).toEqual(getGridColumnIds(30));

        // The grid shows the values of all columns, and empty columns after
        // them
        const data = prepareGridData(rows);
        expect(data.columnIds.slice(26)).toEqual(['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI']);
        expect(data.headerRow.AD).toEqual('H30');
        expect(data.columns.AD).toEqual(['30']);

        // An edit in the 30th column changes its value in the CSV
        const newRows = applyCellEdit(rows, {
            rowIndex: 1, columnId: 'AD', value: '99'
        });
        expect(Object.values(newRows[1]).join(',')).toEqual(
            values.slice(0, 29).join(',') + ',99'
        );
    });
});

describe('getGridColumnCount', () => {
    test('Columns A to K for little or no data', () => {
        expect(getGridColumnCount([])).toEqual(11);
        expect(getGridColumnCount(Array.from(Array(10), () => ({})))).toEqual(11);
        expect(getGridColumnCount([{ A: 'x', B: 'y' }, { A: '1', B: '2' }])).toEqual(11);
    });

    test('Five empty columns after the last column with a value', () => {
        expect(getGridColumnCount([{ A: 'x' }, { A: '1', G: '2' }])).toEqual(12);
        // A CSV header counts
        expect(getGridColumnCount([{ A: 'x', Z: 'only a header' }, { A: '1' }])).toEqual(31);
        expect(getGridColumnCount([{ A: 'x' }, { AD: 0 }])).toEqual(35);
    });

    test('Empty cells and other keys do not count', () => {
        // As in projects started from the placeholder data of v1.1.1 to
        // v1.2.1: cells in every column to Z, values in A and B
        const padded: TableRowData = Object.fromEntries(getGridColumnIds(26).map((id) => [id, '']));
        expect(getGridColumnCount([
            { ...padded, A: 'x', B: 'y' },
            { ...padded, A: '0', B: '1' },
            { ...padded, A: '1', B: ' ', M: null, other: 'value' }
        ])).toEqual(11);
    });

    test('At most 50 columns, A to AX', () => {
        expect(getGridColumnCount([{ AU: '1' }])).toEqual(50);
        expect(getGridColumnCount([{ BZ: '1' }])).toEqual(50);
    });
});

describe('renameLegacyColumnIds', () => {
    test('Renames COL1, COL2, ... AA, AB, ...', () => {
        expect(renameLegacyColumnIds([
            { A: 'x', COL1: 'y', COL10: 'z', other: 'o' },
            { A: '1', COL1: '2' },
            {}
        ])).toEqual([
            { A: 'x', AA: 'y', AJ: 'z', other: 'o' },
            { A: '1', AA: '2' },
            {}
        ]);
    });

    // A row the grid of master v1.1.1 wrote: cells in A to Z, and in its
    // columns past Z, AA, BA, CA, ... (the 27th, 28th, 29th, ... columns)
    const v111Row = (values: Record<string, string>): TableRowData => ({
        ...Object.fromEntries(getGridColumnIds(26).map((id) => [id, ''])),
        AA: '', BA: '', CA: '', DA: '', EA: '',
        ...values
    });

    test('Renames the columns past Z of the grid in master v1.1.1', () => {
        const rows = renameLegacyColumnIds([
            v111Row({ A: 'x', AA: 'h1', DA: 'h4' }),
            v111Row({ A: '1', AA: '1', BA: '2', EA: '5' })
        ]);
        expect(Object.keys(rows[0]).slice(26)).toEqual(['AA', 'AB', 'AC', 'AD', 'AE']);
        expect(rows[0]).toMatchObject({ A: 'x', AA: 'h1', AB: '', AD: 'h4' });
        expect(rows[1]).toMatchObject({ AA: '1', AB: '2', AC: '', AE: '5' });
    });

    test('A COL id wins over a v1.1.1 grid id for the same column', () => {
        // A v1.1.1 project edited in v1.2.1, which added rows without cells
        // and wrote the edits past Z to COL1, COL2, ...
        const rows = renameLegacyColumnIds([
            v111Row({ A: 'x', BA: 'h2' }),
            v111Row({ A: '1', BA: 'old', COL2: 'new' }),
            { COL2: 'new', BA: 'old' }
        ]);
        expect(rows[0]).toMatchObject({ AA: '', AB: 'h2', AC: '' });
        expect(rows[1]).toMatchObject({ A: '1', AB: 'new' });
        expect(rows[2]).toEqual({ AB: 'new' });
    });

    test('Keeps rows with the current column ids as they are', () => {
        const rows: TableRowData[] = [{ A: 'x', AA: 'y', AB: 'z', BA: 'w' }, { A: '1' }];
        expect(renameLegacyColumnIds(rows)).toBe(rows);
        // BA without other ids of two letters: the 53rd column of an
        // imported CSV whose columns AB to AZ are empty, without cells in
        // all of A to Z in a row
        const wideRows: TableRowData[] = [{ A: 'x', AA: 'y', BA: 'z' }, { B: '1', BA: '2' }];
        expect(renameLegacyColumnIds(wideRows)).toBe(wideRows);
    });
});

describe('getGridRebuild', () => {
    const state = { isUpdatingFromGrid: false, hasRendered: true, onDataTab: true };

    test('Rebuilds after data changes outside the grid', () => {
        for (const action of [
            'setTableRowData',
            'addTableRows',
            'fillColumn',
            'restoreStoreState'
        ]) {
            expect(getGridRebuild(action, state)).toEqual('now');
        }
        expect(getGridRebuild('setTextDescription', state)).toEqual('none');
        expect(getGridRebuild('setGoogleSheetStatus', state)).toEqual('none');
    });

    test('Rebuilds after the data store\'s actions that change the rows', () => {
        const dataStore = useDataStore(createPinia());
        // The rebuilds of each action, including the actions it calls
        let rebuilds: string[] = [];
        dataStore.$onAction(({ name, after }) => after(() => {
            rebuilds.push(getGridRebuild(name, state));
        }));
        const rebuildsOf = (action: () => void) => {
            rebuilds = [];
            action();
            return rebuilds.filter((rebuild) => rebuild !== 'none');
        };

        expect(rebuildsOf(() => dataStore.loadFromCSV('a,b\n1,2'))).toEqual(['now']);
        expect(rebuildsOf(() => dataStore.addTableRows(2))).toEqual(['now']);
        expect(rebuildsOf(() => dataStore.fillColumn({ columnName: 'B', equation: 'i' })))
            .toEqual(['now']);
        expect(rebuildsOf(() => dataStore.restoreStoreState())).toEqual(['now']);
        expect(rebuildsOf(() => dataStore.setTextDescription('Text'))).toEqual([]);
    });

    test('Waits for the Data tab', () => {
        expect(getGridRebuild('restoreStoreState', { ...state, onDataTab: false }))
            .toEqual('later');
    });

    test('Ignores the grid\'s own edits, and changes before the first render', () => {
        expect(getGridRebuild('setTableRowData', { ...state, isUpdatingFromGrid: true }))
            .toEqual('none');
        expect(getGridRebuild('setTableRowData', { ...state, hasRendered: false }))
            .toEqual('none');
    });
});

describe('getGridOptions', () => {
    function getColumn(options: ReturnType<typeof getGridOptions>, id: string) {
        return options.columns?.find((column) => column.id === id);
    }

    test('Column types and editing', () => {
        const rows: TableRowData[] = [{ A: 'label', B: 'n', C: 'date' }];
        for (let i = 0; i < 10; i++) {
            rows.push({ A: 'Item ' + i, B: '' + i, C: `2024-01-${10 + i}` });
        }
        const options = getGridOptions(prepareGridData(rows), 'key');

        expect(options.gridKey).toEqual('key');
        expect(getGridOptions(prepareGridData(rows)).gridKey).toBeUndefined();

        // The leftmost text columns are header columns
        expect(getColumn(options, 'A')?.cells?.className).toEqual('hcg-center hcg-header-column');
        expect(getColumn(options, 'B')?.cells?.className).toEqual('hcg-center');
        // Number cells are edited in the clearable number input
        expect(getColumn(options, 'B')?.dataType).toEqual('number');
        expect(getColumn(options, 'B')?.cells?.editMode?.renderer?.type)
            .toEqual(clearableNumberInputType);
        // Dates are shown as written, and sorted by date
        expect(getColumn(options, 'C')?.dataType).toEqual('string');
        expect(getColumn(options, 'C')?.sorting?.compare).toBe(compareDates);
        expect(getColumn(options, 'C')?.cells?.editMode).toBeUndefined();
    });

    test('Calls afterEdit after an edit', () => {
        const afterEdit = vi.fn();
        const options = getGridOptions(prepareGridData(getRows()), void 0, afterEdit);
        // Grid Pro calls it on the edited cell
        const onAfterEdit = options.columnDefaults?.cells?.events?.afterEdit as (() => void) | undefined;
        onAfterEdit?.();
        expect(afterEdit).toHaveBeenCalledOnce();
        expect(getGridOptions(prepareGridData(getRows())).columnDefaults?.cells?.events)
            .toBeUndefined();
    });

    test('CSV headers', () => {
        const rows: TableRowData[] = [{ A: 'Cost {USD}', B: '' }, { A: '1', B: '2' }];
        const options = getGridOptions(prepareGridData(rows));

        // The column id above the CSV header
        expect(options.header?.[0]).toEqual({
            format: 'A',
            className: 'hcg-center',
            columns: [{ columnId: 'A', className: 'hcg-center' }]
        });
        expect(getColumn(options, 'A')?.header?.format).toBeUndefined();
        // No CSV header: the column id only
        expect(options.header?.[1]).toEqual({ columnId: 'B', format: 'B', className: 'hcg-center' });
        expect(getColumn(options, 'B')?.header).toBeUndefined();
    });
});

describe('getSeriesColumnIds', () => {
    test('Gives a series to the columns with cells up to the last value', () => {
        // Placeholder-like rows: cells in every column, values in A and B
        expect([...getSeriesColumnIds([
            { A: 'x', B: 'y', C: '', D: '' },
            { A: '0', B: '1', C: '', D: '' }
        ])]).toEqual(['A', 'B']);

        // An empty middle column with cells keeps its series
        expect([...getSeriesColumnIds([
            { A: 'x', B: 'y', C: '', D: 'z' },
            { A: '0', B: '', C: ' ', D: '1' },
            { A: '1', B: '2', C: '', D: '' }
        ])]).toEqual(['A', 'B', 'C', 'D']);

        // A column without cells (rows loaded from a CSV) gets none, nor
        // does a header without values
        expect([...getSeriesColumnIds([
            { A: 'x', B: 'y', C: 'z', D: 'only a header' },
            { A: '0', C: '1' },
            { A: '1', C: '2', AA: '' }
        ])]).toEqual(['A', 'C']);
    });
});

describe('getNavigationTarget', () => {
    const size = { rowCount: 100, columnCount: 10, pageRowCount: 20 };
    const at = { rowIndex: 50, columnIndex: 3 };

    test('Moves a page, to the row\'s ends or to the grid\'s corners', () => {
        expect(getNavigationTarget('PageDown', false, at, size)).toEqual([70, 3]);
        expect(getNavigationTarget('PageUp', false, at, size)).toEqual([30, 3]);
        expect(getNavigationTarget('Home', false, at, size)).toEqual([50, 0]);
        expect(getNavigationTarget('End', false, at, size)).toEqual([50, 9]);
        expect(getNavigationTarget('Home', true, at, size)).toEqual([0, 0]);
        expect(getNavigationTarget('End', true, at, size)).toEqual([99, 9]);
    });

    test('Stops at the first and the last row', () => {
        expect(getNavigationTarget('PageDown', false, { rowIndex: 95, columnIndex: 0 }, size)).toEqual([99, 0]);
        expect(getNavigationTarget('PageUp', false, { rowIndex: 5, columnIndex: 0 }, size)).toEqual([0, 0]);
    });

    test('Leaves other keys alone', () => {
        expect(getNavigationTarget('ArrowDown', false, at, size)).toBeUndefined();
        expect(getNavigationTarget('a', true, at, size)).toBeUndefined();
    });
});

describe('getCellEditorLabel', () => {
    test('Names the column, its CSV header and the row', () => {
        expect(getCellEditorLabel('B', 'Sensor Data', 5)).toEqual('Column B, Sensor Data, row 5');
        expect(getCellEditorLabel('C', void 0, 1)).toEqual('Column C, row 1');
        expect(getCellEditorLabel('C', void 0, void 0)).toEqual('Column C');
    });
});

describe('detectColumnDataType', () => {
    test('Numbers', () => {
        expect(detectColumnDataType(['1', '2.5', '-3', '0', '', '4', '5'])).toEqual('number');
    });

    test('Dates', () => {
        expect(detectColumnDataType(['2024-01-01', '2024-01-02', '01/03/2024'])).toEqual('datetime');
    });

    test('Text ending in a number is not a date', () => {
        expect(detectColumnDataType(['Item 1', 'Item 2', 'Item 3'])).toEqual('string');
    });
});

describe('compareDates', () => {
    test('Compares by time', () => {
        expect(compareDates('12/31/2023', '2024-01-01')).toBeLessThan(0);
        expect(compareDates('2024-02-01', '2024-01-15')).toBeGreaterThan(0);
    });
});

describe('Cell edits', () => {
    test('Keep the CSV header row and the other rows', () => {
        const rows = getRows();
        const data = prepareGridData(rows);
        const rowId = 0; // First grid row
        const newRows = applyCellEdit(rows, {
            rowIndex: data.firstDataRowIndex + rowId,
            columnId: 'B',
            value: toStoreValue(5)
        });

        expect(newRows).toEqual([
            { A: 'Index (X value)', B: 'Sensor Data (Y value)' },
            { A: '0', B: '5' },
            { A: '1', B: '0.164' },
            { A: '2', B: '0.618' }
        ]);
        // The store's rows are not changed
        expect(rows[1].B).toEqual('0.000');

        // The edited rows give the same grid
        expect(prepareGridData(newRows).headerRow).toEqual(data.headerRow);
    });

    test('Keep zeros', () => {
        expect(toStoreValue(0)).toEqual('0');
        expect(toStoreValue(false)).toEqual('false');
        expect(toStoreValue(null)).toEqual('');
        const newRows = applyCellEdit(getRows(), {
            rowIndex: 2, columnId: 'A', value: toStoreValue(0)
        });
        expect(newRows[2].A).toEqual('0');
    });

    test('Change only the edited cell, which keeps its column in the CSV', () => {
        const rows: TableRowData[] = [{ A: 'x', B: 'y' }, { A: '1', B: '2' }, {}];
        const newRows = applyCellEdit(rows, {
            rowIndex: 2, columnId: 'C', value: '3'
        });

        // The other rows get no cells, and are the same objects
        expect(newRows).toEqual([{ A: 'x', B: 'y' }, { A: '1', B: '2' }, { C: '3' }]);
        expect(newRows[0]).toBe(rows[0]);
        const data = useDataStore(createPinia());
        data.setTableRowData(newRows);
        expect(data.tableCSV).toBe('x;y\n1;2\n;;3');
    });

    test('Add the rows up to an edited row after the last one', () => {
        const newRows = applyCellEdit([{ A: 'x' }], { rowIndex: 2, columnId: 'B', value: '5' });
        expect(newRows).toEqual([{ A: 'x' }, {}, { B: '5' }]);
    });

    test('Give a column without cells no cells in the other rows', () => {
        // Rows loaded from a CSV with an empty middle column, B
        const rows: TableRowData[] = [{ A: 'x', C: 'z' }, { A: '1', C: '3' }, { A: '2', C: '4' }];
        const newRows = applyCellEdit(rows, { rowIndex: 1, columnId: 'A', value: '7' });
        expect(newRows.every((row) => !('B' in row))).toBe(true);
    });
});
