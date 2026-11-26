import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { GoogleSheetStatus, useDataStore } from '../../../src/app/editor/store/modules/data';

const toCSV = (rows: Array<Record<string, unknown>>) =>
    rows.map(row => Object.values(row).join(';')).join('\n');

describe('data store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('Starts with the default state, keys in order', () => {
        const store = useDataStore();
        expect(Object.keys(store.$state)).toEqual([
            'tableCSV', 'tableRowData', 'tableHeaders', 'textDescription', 'selectedDataSource',
            'spreadsheetSetupComplete', 'googleSpreadsheetURL', 'googleApiKey', 'googleAutoUpdateEnabled',
            'googleAutoUpdateFrequency', 'googleSheetStatus', 'googleSheetErrorMessage', 'dataSourcesList'
        ]);
        expect(store.tableRowData).toEqual([]);
        expect(store.googleSheetStatus).toBe(GoogleSheetStatus.Loading);
        expect(store.dataSourcesList).toEqual([
            { name: 'Grid', value: 'table' },
            { name: 'Google Sheets', value: 'googlesheets' }
        ]);
    });

    describe('restoreStoreState', () => {
        test('Takes the rows and description from the new state and regenerates the CSV', () => {
            const store = useDataStore();
            const tableRowData = [{ A: 'x', B: 'y' }, { A: '1', B: '2' }];
            store.restoreStoreState({ tableRowData, textDescription: 'Desc' });
            expect(store.tableRowData).toEqual(tableRowData);
            expect(store.textDescription).toBe('Desc');
            expect(store.tableCSV).toBe('x;y\n1;2');
        });

        test('Falls back to an empty description', () => {
            const store = useDataStore();
            store.setTextDescription('Old');
            store.restoreStoreState({ tableRowData: [] });
            expect(store.textDescription).toBe('');
            expect(store.tableCSV).toBe('');
        });

        test('Restores the placeholder data without a new state', () => {
            const store = useDataStore();
            store.setTextDescription('Old');
            store.restoreStoreState();

            expect(store.textDescription).toBe('');
            expect(store.tableRowData).toHaveLength(200);
            expect(store.tableRowData[0]).toMatchObject({ A: 'Index (X value)', B: 'Sensor Data (Y value)', C: '' });
            expect(Object.keys(store.tableRowData[0])).toHaveLength(26);
            expect(store.tableRowData[2]).toMatchObject({ A: '1', B: ((Math.sin(1 / 3) * 1) / 2).toFixed(3), Z: '' });
            expect(store.tableCSV).toBe(toCSV(store.tableRowData));
        });

        test('Leaves the other data state alone', () => {
            const store = useDataStore();
            store.setSelectedDataSource('googlesheets');
            store.setGoogleApiKey('key');
            store.restoreStoreState();
            expect(store.selectedDataSource).toBe('googlesheets');
            expect(store.googleApiKey).toBe('key');
        });
    });

    test('setToPlaceholderData sets the placeholder rows and their CSV', () => {
        const store = useDataStore();
        store.setToPlaceholderData();
        expect(store.tableRowData).toHaveLength(200);
        expect(store.tableCSV).toBe(toCSV(store.tableRowData));
    });

    test('setTableRowData sets the rows and generates the CSV', () => {
        const store = useDataStore();
        store.setTableRowData([{ A: 'a', B: 'b', C: '' }, { A: 1, B: true }, {}]);
        expect(store.tableCSV).toBe('a;b;\n1;true\n');
    });

    test('setTableCSV only sets the CSV', () => {
        const store = useDataStore();
        store.setTableRowData([{ A: 'a' }]);
        store.setTableCSV('');
        expect(store.tableCSV).toBe('');
        expect(store.tableRowData).toEqual([{ A: 'a' }]);
    });

    test('updateCellValue replaces the row object in place and regenerates the CSV', () => {
        const store = useDataStore();
        store.setTableRowData([{ A: 'x', B: 'y' }, { A: '1', B: '2' }]);
        const rows = store.tableRowData;
        const oldRow = store.tableRowData[1];

        store.updateCellValue({ rowIndex: 1, columnName: 'B', value: '5' });

        expect(store.tableRowData).toBe(rows);
        expect(store.tableRowData[1]).not.toBe(oldRow);
        expect(oldRow).toEqual({ A: '1', B: '2' });
        expect(store.tableRowData[1]).toEqual({ A: '1', B: '5' });
        expect(store.tableCSV).toBe('x;y\n1;5');

        store.updateCellValue({ rowIndex: 0, columnName: 'C', value: 'z' });
        expect(store.tableCSV).toBe('x;y;z\n1;5');
    });

    test('addTableRows appends empty rows and regenerates the CSV', () => {
        const store = useDataStore();
        store.setTableRowData([{ A: 'x' }]);
        const rows = store.tableRowData;
        store.addTableRows(2);
        expect(store.tableRowData).toBe(rows);
        expect(store.tableRowData).toEqual([{ A: 'x' }, {}, {}]);
        expect(store.tableCSV).toBe('x\n\n');
    });

    describe('fillColumn', () => {
        test('Fills every row but the header row with the result of the equation', () => {
            const store = useDataStore();
            store.setTableRowData([
                { A: 'Header A', B: 'Header B' },
                { A: '1', B: '' },
                { A: '2', B: 'old' },
                { A: '3' }
            ]);
            const headerRow = store.tableRowData[0];

            store.fillColumn({ columnName: 'B', equation: '2 * A + i' });

            expect(store.tableRowData).toEqual([
                { A: 'Header A', B: 'Header B' },
                { A: '1', B: '3' },
                { A: '2', B: '6' },
                { A: '3', B: '9' }
            ]);
            // Rows are copied, not changed
            expect(store.tableRowData[0]).not.toBe(headerRow);
            expect(store.tableCSV).toBe('Header A;Header B\n1;3\n2;6\n3;9');
        });

        test('Leaves the rows unchanged when the equation fails', () => {
            const store = useDataStore();
            store.setTableRowData([{ A: 'h' }, { A: '1' }]);
            const rows = store.tableRowData;
            expect(() => store.fillColumn({ columnName: 'B', equation: 'unknownSymbol * 2' })).toThrow();
            expect(store.tableRowData).toBe(rows);
            expect(store.tableCSV).toBe('h\n1');
        });
    });

    describe('loadFromCSV', () => {
        test('Detects a tab delimiter first', () => {
            const store = useDataStore();
            store.loadFromCSV('a\tb;c\n1\t2,3');
            expect(store.tableRowData).toEqual([{ A: 'a', B: 'b;c' }, { A: '1', B: '2,3' }]);
        });

        test('Detects a semicolon delimiter before commas', () => {
            const store = useDataStore();
            store.loadFromCSV('a;b,c\n1;2');
            expect(store.tableRowData).toEqual([{ A: 'a', B: 'b,c' }, { A: '1', B: '2' }]);
        });

        test('Falls back to a comma delimiter', () => {
            const store = useDataStore();
            store.loadFromCSV('a,b\n1,2');
            expect(store.tableRowData).toEqual([{ A: 'a', B: 'b' }, { A: '1', B: '2' }]);
            expect(store.tableCSV).toBe('a;b\n1;2');
        });

        test('Drops empty cells', () => {
            const store = useDataStore();
            store.loadFromCSV('a,,c\n,2,');
            expect(store.tableRowData).toEqual([{ A: 'a', C: 'c' }, { B: '2' }]);
        });

        test('Names columns past Z COL1, COL2, ...', () => {
            const store = useDataStore();
            const cells = Array.from({ length: 28 }, (_, i) => 'v' + i);
            store.loadFromCSV(cells.join(',') + '\n1');
            const header = store.tableRowData[0];
            expect(Object.keys(header)).toHaveLength(28);
            expect(header.A).toBe('v0');
            expect(header.Z).toBe('v25');
            expect(header.COL1).toBe('v26');
            expect(header.COL2).toBe('v27');
            expect(store.tableRowData[1]).toEqual({ A: '1' });
        });

        test('Sets the rows through setTableRowData', () => {
            const store = useDataStore();
            const actions: string[] = [];
            store.$onAction(({ name }) => {
                actions.push(name);
            });
            store.loadFromCSV('a,b');
            expect(actions).toEqual(['loadFromCSV', 'setTableRowData']);
        });
    });

    describe('getters', () => {
        test('numRows and numCols count the rows and the columns of the first row', () => {
            const store = useDataStore();
            expect(store.numRows).toBe(0);
            expect(store.numCols).toBe(0);
            store.setTableRowData([{ A: 'a', B: 'b', C: '' }, { A: '1' }]);
            expect(store.numRows).toBe(2);
            expect(store.numCols).toBe(3);
        });

        test('tableColumnNamesWithData lists sorted columns with a non-blank value in any row', () => {
            const store = useDataStore();
            store.setTableRowData([
                { C: 'c', A: ' ', B: '' },
                { B: null, D: 0, E: '  x ' },
                { A: false }
            ]);
            expect(store.tableColumnNamesWithData).toEqual(['A', 'C', 'D', 'E']);
        });

        test('column returns the values of a column, null where missing', () => {
            const store = useDataStore();
            store.setTableRowData([{ A: 'h', B: 'x' }, { A: '1' }, { A: '2', B: '' }]);
            expect(store.column('A')).toEqual(['h', '1', '2']);
            expect(store.column('B')).toEqual(['x', null, '']);
            expect(store.column('Q')).toEqual([null, null, null]);
        });

        test('googleSpreadsheetId extracts the id from a spreadsheet URL', () => {
            const store = useDataStore();
            expect(store.googleSpreadsheetId).toBe('');
            store.setGoogleSpreadsheetURL('  https://docs.google.com/spreadsheets/d/1a-B_c.~9/edit#gid=0  ');
            expect(store.googleSpreadsheetURL).toBe('https://docs.google.com/spreadsheets/d/1a-B_c.~9/edit#gid=0');
            expect(store.googleSpreadsheetId).toBe('1a-B_c.~9');
            store.setGoogleSpreadsheetURL('https://docs.google.com/spreadsheets/d/abc');
            expect(store.googleSpreadsheetId).toBe('abc');
        });

        test('tableCSVDataURI encodes the CSV as a data URI', () => {
            const store = useDataStore();
            expect(store.tableCSVDataURI).toBe('');
            store.setTableRowData([{ A: 'a b', B: 'ø' }, { A: '1', B: '2' }]);
            expect(store.tableCSVDataURI).toBe('data:text/csv;charset=utf-8,a%20b;%C3%B8%0A1;2');
        });
    });

    test('Google Sheets setters set their value, trimming the URL and API key', () => {
        const store = useDataStore();
        store.setSelectedDataSource('googlesheets');
        store.setSpreadsheetSetupComplete(true);
        store.setGoogleApiKey('  key ');
        store.setGoogleAutoUpdateEnabled(true);
        store.setGoogleSheetStatus(GoogleSheetStatus.Error);
        store.setGoogleSheetErrorMessage('Failed');
        expect(store.$state).toMatchObject({
            selectedDataSource: 'googlesheets',
            spreadsheetSetupComplete: true,
            googleApiKey: 'key',
            googleAutoUpdateEnabled: true,
            googleSheetStatus: GoogleSheetStatus.Error,
            googleSheetErrorMessage: 'Failed'
        });
    });
});
