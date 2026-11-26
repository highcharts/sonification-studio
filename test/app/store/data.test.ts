import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Options } from 'highcharts';
import Highcharts from '../../../src/app/editor/core/highchartsSetup';
import { defaultChartOptions } from '../../../src/app/editor/core/defaultChartOptions';
import {
    GoogleSheetStatus,
    tableCSVDelimiter,
    useDataStore,
    type TableRow
} from '../../../src/app/editor/store/modules/data';

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

    test('The CSV has each value in its column', () => {
        const store = useDataStore();
        store.setTableRowData([{ C: 'c', A: 'a', other: 'x' }, { B: '2' }, { COL2: 'z', A: 0 }]);
        expect(store.tableCSV).toBe(
            'a;;c;x\n;2\n0' + ';'.repeat(27) + 'z'
        );
    });

    describe('Values with the delimiter, quotes or line breaks', () => {
        const rows: TableRow[] = [
            { A: 'Index', B: 'Temp; C', C: 'Say "hi"', D: '"Quoted"' },
            { A: '1', B: '2;5', C: 'Line\nbreak', D: '"' },
            { A: '2', B: 'Plain', C: 'Windows\r\nline break' }
        ];
        const csv = 'Index;"Temp; C";"Say ""hi""";"""Quoted"""\n' +
            '1;"2;5";"Line\nbreak";""""\n' +
            '2;Plain;"Windows\r\nline break"';

        test('Are quoted in the CSV, with their quotes doubled', () => {
            const store = useDataStore();
            store.setTableRowData(rows);
            expect(store.tableCSV).toBe(csv);
        });

        test('Keep their columns when the CSV is loaded again', () => {
            const store = useDataStore();
            store.setTableRowData(rows);
            store.loadFromCSV(store.tableCSV, tableCSVDelimiter);
            expect(store.tableRowData).toEqual(rows);
            expect(store.tableCSV).toBe(csv);
        });

        // The series the chart's data module reads from the store's CSV
        function readSeries(rows: TableRow[]): Options['series'] {
            const store = useDataStore();
            store.setTableRowData(rows);
            let series: Options['series'];
            new Highcharts.Data({
                ...defaultChartOptions.data,
                csv: store.tableCSV,
                firstRowAsNames: true,
                complete: (options) => {
                    series = options.series;
                }
            });
            return series;
        }

        test('Are read by the chart\'s data module', () => {
            const series = readSeries([
                { A: 'Index', B: 'Temp; C', C: 'Say "hi" there' },
                { A: '1', B: '2', C: '3' },
                { A: '2', B: '4', C: '5' }
            ]);
            expect(series?.map((s) => s.name)).toEqual(['Temp; C', 'Say "hi" there']);
            expect(series?.map((s) => 'data' in s && s.data)).toEqual([
                [[1, 2], [2, 4]],
                [[1, 3], [2, 5]]
            ]);
        });

        test('Starting with "#" are quoted, so the chart\'s data module keeps their rows', () => {
            const store = useDataStore();
            // The data module skips the lines that start with "#" (comments)
            const rows = [
                { A: '# of items', B: 'Sales' },
                { A: '#a', B: '10' },
                { A: ' #b', B: '20' },
                { A: 'c', B: '#30' }
            ];
            store.setTableRowData(rows);
            expect(store.tableCSV).toBe('"# of items";Sales\n"#a";10\n" #b";20\nc;"#30"');

            const series = readSeries(rows);
            expect(series?.map((s) => s.name)).toEqual(['Sales']);
            // (The data module trims text values)
            expect(series?.map((s) => 'data' in s && s.data)).toEqual([
                [['#a', 10], ['#b', 20], ['c', '#30']]
            ]);
        });
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
        test('Loads no rows from an empty CSV', () => {
            const store = useDataStore();
            // The CSV of a project saved without rows
            store.restoreStoreState({ tableRowData: [] });
            store.loadFromCSV(store.tableCSV, tableCSVDelimiter);
            expect(store.tableRowData).toEqual([]);
            expect(store.tableCSV).toBe('');
        });

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

        test('Leaves out quoted values when detecting the delimiter', () => {
            const store = useDataStore();
            store.loadFromCSV('"Temp; C",b\n1,"2\t3"');
            expect(store.tableRowData).toEqual([{ A: 'Temp; C', B: 'b' }, { A: '1', B: '2\t3' }]);
        });

        test('Uses the delimiter given', () => {
            const store = useDataStore();
            // A single column of the app's own CSV has no delimiter to detect
            store.setTableRowData([{ A: 'Value' }, { A: '1,5' }, { A: '2\t5' }]);
            expect(store.tableCSV).toBe('Value\n1,5\n2\t5');
            store.loadFromCSV(store.tableCSV, tableCSVDelimiter);
            expect(store.tableRowData).toEqual([{ A: 'Value' }, { A: '1,5' }, { A: '2\t5' }]);
            expect(store.tableCSV).toBe('Value\n1,5\n2\t5');
        });

        test('Drops empty cells', () => {
            const store = useDataStore();
            store.loadFromCSV('a,,c\n,2,');
            expect(store.tableRowData).toEqual([{ A: 'a', C: 'c' }, { B: '2' }]);
            // The CSV keeps the values in their columns
            expect(store.tableCSV).toBe('a;;c\n;2');
        });

        test('Keeps an empty first cell of the first row', () => {
            const store = useDataStore();
            store.loadFromCSV(';b;c\n1;2;3');
            expect(store.tableRowData).toEqual([{ B: 'b', C: 'c' }, { A: '1', B: '2', C: '3' }]);
            store.loadFromCSV(',b');
            expect(store.tableRowData).toEqual([{ B: 'b' }]);
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

        test('tableColumnNamesWithData lists the columns in column order, other keys last', () => {
            const store = useDataStore();
            store.setTableRowData([
                { other: 'o', COL10: '10', COL2: '2', D: 'd', COL1: '1', _: '_', Z: 'z', B: 'b' }
            ]);
            expect(store.tableColumnNamesWithData).toEqual(['B', 'D', 'Z', 'COL1', 'COL2', 'COL10', '_', 'other']);
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

        test('googleSpreadsheetId accepts a query or fragment right after the id', () => {
            const store = useDataStore();
            [
                'https://docs.google.com/spreadsheets/d/1a-B_c.~9?usp=sharing',
                'https://docs.google.com/spreadsheets/d/1a-B_c.~9#gid=0',
                'https://docs.google.com/spreadsheets/d/1a-B_c.~9/edit?usp=sharing#gid=0'
            ].forEach(url => {
                store.setGoogleSpreadsheetURL(url);
                expect(store.googleSpreadsheetId).toBe('1a-B_c.~9');
            });
        });

        test('googleSpreadsheetId is empty for a URL that is not a spreadsheet URL', () => {
            const store = useDataStore();
            [
                'https://example.com/sheet',
                'docs.google.com/spreadsheets/d/',
                'https://docs.google.com/spreadsheets/d/abc def',
                'abc'
            ].forEach(url => {
                store.setGoogleSpreadsheetURL(url);
                expect(store.googleSpreadsheetId).toBe('');
            });
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
