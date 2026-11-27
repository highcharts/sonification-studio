import { describe, expect, test } from 'vitest';
import { createPinia } from 'pinia';
import {
    applyCellEdit,
    clearableNumberInputType,
    compareDates,
    detectColumnDataType,
    getGridColumnIds,
    getGridOptions,
    getGridRebuild,
    prepareGridData,
    toStoreValue,
    type TableRowData
} from '../../../src/app/editor/core/utils/gridData';
import { useDataStore } from '../../../src/app/editor/store/modules/data';

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
        const rows: TableRowData[] = [{ A: 'x' }, { A: '1', B: '2', C: '3' }];
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

describe('Column ids', () => {
    // The rows the store makes from an imported CSV
    function loadFromCSV(csv: string): TableRowData[] {
        const dataStore = useDataStore(createPinia());
        dataStore.loadFromCSV(csv);
        return dataStore.tableRowData;
    }

    test('A-Z, then COL1, COL2, ...', () => {
        const ids = getGridColumnIds(30);
        expect(ids.slice(0, 3)).toEqual(['A', 'B', 'C']);
        expect(ids.slice(25)).toEqual(['Z', 'COL1', 'COL2', 'COL3', 'COL4']);
    });

    test('Match the columns of an imported CSV with more than 26 columns', () => {
        const values = Array.from({ length: 30 }, (_, i) => i + 1);
        const rows = loadFromCSV(
            values.map((i) => 'H' + i).join(',') + '\n' + values.join(',')
        );
        expect(Object.keys(rows[1])).toEqual(getGridColumnIds(30));

        // The grid shows the values of all columns
        const data = prepareGridData(rows);
        expect(data.columnIds.slice(26, 30)).toEqual(['COL1', 'COL2', 'COL3', 'COL4']);
        expect(data.headerRow.COL4).toEqual('H30');
        expect(data.columns.COL4).toEqual(['30']);

        // An edit in the 30th column changes its value in the CSV
        const newRows = applyCellEdit(rows, {
            rowIndex: 1, columnId: 'COL4', value: '99'
        }, data.columnIds);
        expect(Object.values(newRows[1]).join(',')).toEqual(
            values.slice(0, 29).join(',') + ',99'
        );
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

    test('CSV headers', () => {
        const rows: TableRowData[] = [{ A: 'Cost {USD}', B: '' }, { A: '1', B: '2' }];
        const options = getGridOptions(prepareGridData(rows));

        // The column id above the CSV header, which describes the column
        expect(options.header?.[0]).toMatchObject({
            format: 'A',
            columns: [{ columnId: 'A', accessibility: { description: 'Cost {USD}' } }]
        });
        expect(getColumn(options, 'A')?.header?.format).toBeUndefined();
        // No CSV header: the column id only
        expect(options.header?.[1]).toEqual({ columnId: 'B', format: 'B', className: 'hcg-center' });
        expect(getColumn(options, 'B')?.header).toBeUndefined();
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
