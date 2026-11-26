import { describe, expect, test } from 'vitest';
import { dataStore } from '../../src/app/editor/store/modules/data';

type Row = Record<string, string>;

function fillColumn(rows: Row[], columnName: string, equation: string) {
    const state = { tableRowData: rows, tableCSV: '' };
    dataStore.mutations.fillColumn(state, { columnName, equation });
    return state;
}

// A header row, then string cell values, with '' for empty cells (the grid
// can also omit empty cells, see loadFromCSV).
function getRows(): Row[] {
    return [
        { A: 'Index', B: 'Value', C: '' },
        { A: '0', B: '1.5', C: '' },
        { A: '1', B: '-2', C: '' },
        { A: '2', B: '4', C: '' }
    ];
}

describe('dataStore fillColumn (equations)', () => {
    test('Fills from the row index i, leaving the header row alone', () => {
        const state = fillColumn(getRows(), 'C', 'i * 2');
        expect(state.tableRowData.map((row) => row.C)).toEqual(['', '2', '4', '6']);
        expect(state.tableCSV).toBe('Index;Value;\n0;1.5;2\n1;-2;4\n2;4;6');
    });

    test('Refers to other columns by column name', () => {
        const state = fillColumn(getRows(), 'C', '2 * B + A');
        expect(state.tableRowData.map((row) => row.C)).toEqual(['', '3', '-3', '10']);
    });

    test('Treats empty string cells as zero', () => {
        const state = fillColumn(getRows(), 'D', 'C + 1');
        expect(state.tableRowData.slice(1).map((row) => row.D)).toEqual(['1', '1', '1']);
    });

    test('Supports functions and constants', () => {
        const state = fillColumn(getRows(), 'C', 'round(sin(i) * 100) + pi');
        expect(state.tableRowData.slice(1).map((row) => row.C)).toEqual([
            '' + (84 + Math.PI), '' + (91 + Math.PI), '' + (14 + Math.PI)
        ]);
    });

    test('Throws on invalid equations and keeps the data unchanged', () => {
        const rows = getRows();
        const state = { tableRowData: rows, tableCSV: 'unchanged' };
        const fill = (equation: string) => () =>
            dataStore.mutations.fillColumn(state, { columnName: 'C', equation });

        expect(fill('2 *')).toThrow(SyntaxError);
        expect(fill('2 * Q')).toThrow('Undefined symbol Q');
        expect(state.tableRowData).toBe(rows);
        expect(state.tableCSV).toBe('unchanged');
    });
});
