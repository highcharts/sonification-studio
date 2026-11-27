import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDataStore, type TableRow } from '../../../src/app/editor/store/modules/data';

function fillColumn(rows: TableRow[], columnName: string, equation: string) {
    const store = useDataStore();
    store.setTableRowData(rows);
    store.fillColumn({ columnName, equation });
    return store;
}

// A header row, then string cell values, with '' for empty cells (the grid
// can also omit empty cells, see loadFromCSV).
function getRows(): TableRow[] {
    return [
        { A: 'Index', B: 'Value', C: '' },
        { A: '0', B: '1.5', C: '' },
        { A: '1', B: '-2', C: '' },
        { A: '2', B: '4', C: '' }
    ];
}

describe('data store fillColumn (equations)', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('Fills from the row index i, leaving the header row alone', () => {
        const store = fillColumn(getRows(), 'C', 'i * 2');
        expect(store.tableRowData.map((row) => row.C)).toEqual(['', '2', '4', '6']);
        expect(store.tableCSV).toBe('Index;Value;\n0;1.5;2\n1;-2;4\n2;4;6');
    });

    test('Refers to other columns by column name', () => {
        const store = fillColumn(getRows(), 'C', '2 * B + A');
        expect(store.tableRowData.map((row) => row.C)).toEqual(['', '3', '-3', '10']);
    });

    test('Leaves the result empty where a cell the equation uses is empty', () => {
        const store = fillColumn(getRows(), 'D', 'C + 1');
        expect(store.tableRowData.slice(1).map((row) => row.D)).toEqual(['', '', '']);
    });

    test('Supports functions and constants', () => {
        const store = fillColumn(getRows(), 'C', 'round(sin(i) * 100) + pi');
        expect(store.tableRowData.slice(1).map((row) => row.C)).toEqual([
            '' + (84 + Math.PI), '' + (91 + Math.PI), '' + (14 + Math.PI)
        ]);
    });

    test('Throws on invalid equations and keeps the data unchanged', () => {
        const store = useDataStore();
        store.setTableRowData(getRows());
        const rowsBefore = store.tableRowData;
        const csvBefore = store.tableCSV;
        const fill = (equation: string) => () =>
            store.fillColumn({ columnName: 'C', equation });

        expect(fill('2 *')).toThrow(SyntaxError);
        expect(fill('2 * q')).toThrow('Undefined symbol q');
        expect(store.tableRowData).toBe(rowsBefore);
        expect(store.tableRowData).toEqual(getRows());
        expect(store.tableCSV).toBe(csvBefore);
    });
});
