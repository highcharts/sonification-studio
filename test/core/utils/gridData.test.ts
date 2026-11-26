import { describe, expect, test } from 'vitest';
import {
    applyCellEdit,
    compareDates,
    detectColumnDataType,
    getGridColumnIds,
    prepareGridData,
    toStoreValue,
    type TableRowData
} from '../../../src/app/editor/core/utils/gridData';

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
        expect(data.columnIds).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
        expect(data.columns.G).toEqual(['', '', '']);
    });

    test('Uses the columns of all rows', () => {
        const rows = [{ A: 'x' }, { A: '1', B: '2', C: '3' }];
        expect(prepareGridData(rows).columnIds.length).toEqual(8);
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
        }, data.columnIds);

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
        }, getGridColumnIds(7));
        expect(newRows[2].A).toEqual('0');
    });

    test('Keep the values in column order', () => {
        const rows: TableRowData[] = [{ A: 'x', B: 'y' }, { A: '1', B: '2' }, {}];
        const newRows = applyCellEdit(rows, {
            rowIndex: 2, columnId: 'C', value: '3'
        }, getGridColumnIds(7));

        expect(newRows.map((row) => Object.values(row).join(';'))).toEqual([
            'x;y;',
            '1;2;',
            ';;3'
        ]);
    });
});
