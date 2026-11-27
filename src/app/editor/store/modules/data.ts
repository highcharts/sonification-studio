/*
    Data store for the chart/table data.

    The source data for the table is kept here, and updating this will
    update the data grid. Updating the data grid will trigger a recompute
    of the CSV. We are using the table CSV generator in order to preserve
    table sorting/filtering, but could consider rolling our own for better
    performance.

    Updating values in the data grid should be reflected in the source data,
    so that the source data always mirrors the data the grid is working with.
 */

import { defineStore } from 'pinia';
import { parseCSV } from '../../core/utils/csvParser';
import {
    getColumnIndex,
    getGridColumnIds,
    maxGridColumnCount,
    renameLegacyColumnIds
} from '../../core/utils/gridData';
import { compile, isSymbolNode, parse, type MathNode } from 'mathjs';

// Value of one grid cell. Usually a string, but the grid and project files
// can hold other primitives.
export type TableCellValue = string | number | boolean | null;

// One grid row: column name ('A' to 'Z', then 'AA', 'AB', ...) -> cell value.
// Row 0 holds the column headers. A row has no cells for the columns it has
// no value in (loadFromCSV), unless they were emptied in the grid.
export type TableRow = Record<string, TableCellValue>;

export interface FillColumnProps {
    columnName: string;
    equation: string;
}

export enum GoogleSheetStatus {
    Loading = 0,
    Success,
    Error,
}

export interface DataSourceOption {
    name: string;
    value: string;
}

export interface DataState {
    tableCSV: string;
    tableRowData: TableRow[];
    tableHeaders: string[];
    textDescription: string;
    selectedDataSource: string;
    spreadsheetSetupComplete: boolean;
    googleSpreadsheetURL: string;
    googleApiKey: string;
    googleAutoUpdateEnabled: boolean;
    googleAutoUpdateFrequency: number;
    googleSheetStatus: GoogleSheetStatus;
    googleSheetErrorMessage: string;
    dataSourcesList: DataSourceOption[];
}

// The part of the data state that is restored from project files and
// localStorage sessions. Project files have no Google API key (see
// downloadProjectFile): restoring a state without one keeps the key the
// editor has.
export interface DataRestoreState {
    tableRowData: TableRow[];
    textDescription?: string;
    selectedDataSource?: string;
    spreadsheetSetupComplete?: boolean;
    googleSpreadsheetURL?: string;
    googleApiKey?: string;
    googleAutoUpdateEnabled?: boolean;
    googleAutoUpdateFrequency?: number;
}

const dataSources = ['table', 'googlesheets'];

function isEmptyCell(value: TableCellValue | undefined): boolean {
    return value === undefined || value === null || String(value).trim() === '';
}

// The columns an equation refers to. The name of a column the grid can show
// (A to AX), or of a column in the rows, always means the column, also where
// mathjs has a constant or a unit with that name (E, F, AU, ...), so that a
// column is never taken for one when it is empty. Other names, such as PI,
// keep their mathjs meaning.
function getEquationColumnNames(equation: string, rows: TableRow[]): string[] {
    const isColumnName = (name: string): boolean => {
        const index = getColumnIndex(name);
        return index >= 0 && (
            index < maxGridColumnCount ||
            rows.some((row) => Object.hasOwn(row, name))
        );
    };
    const names = new Set<string>();
    parse(equation).traverse((node: MathNode, path: string) => {
        // Not the name of a function called, as "sin" in "sin(A)"
        if (isSymbolNode(node) && path !== 'fn' && isColumnName(node.name)) {
            names.add(node.name);
        }
    });
    return [...names];
}

// The values of a column filled from an equation, by row (the first row, the
// column headers, is not filled). Where a column the equation refers to has
// an empty cell, the row's value is left empty. "i" is the row number.
function getFillValues(rows: TableRow[], equation: string): Array<string | undefined> {
    const columnNames = getEquationColumnNames(equation, rows);
    const expression = compile(equation);
    return rows.map((row, rowIx) => {
        if (!rowIx) {
            return void 0;
        }
        const scope: Record<string, TableCellValue | number> = { i: rowIx };
        for (const name of columnNames) {
            if (isEmptyCell(row[name])) {
                return '';
            }
            scope[name] = row[name];
        }
        return '' + expression.evaluate(scope);
    });
}

// The data of a new project: a header row and 199 rows of values, in the
// columns A and B. The grid shows the columns after them empty (see
// getGridColumnCount).
function getPlaceholderData(): Array<Record<string, string>> {
    const data: Array<Record<string, string>> = [{
        A: 'Index (X value)',
        B: 'Sensor Data (Y value)'
    }];
    for (let i = 0; i < 199; i++) {
        data.push({
            A: '' + i,
            B: ((Math.sin(i / 3) * i) / 2).toFixed(3)
        });
    }
    return data;
}

// Delimiter of the values in the store's CSV (tableCSV)
export const tableCSVDelimiter = ';';

// A value in the store's CSV. A value with the delimiter, a quote or a line
// break is quoted, with its quotes doubled, so that it stays one value when
// the CSV is parsed by loadFromCSV. The chart's data module (Highcharts
// 13.1.1) reads them too, except values with a line break, or with a quote
// at their start or (when a value follows) their end. The data module also
// skips lines that start with "#" (after blanks) as comments, so a value
// starting with "#" is quoted too (only a line's first value needs it).
function toCSVValue(value: TableCellValue | undefined): string {
    const text = value === undefined || value === null ? '' : String(value);
    const needsQuotes = text.includes(tableCSVDelimiter) || /["\r\n]|^\s*#/.test(text);
    return needsQuotes ? '"' + text.replace(/"/g, '""') + '"' : text;
}

// A row's values in a CSV line, each in its column. A row may lack the
// columns between its values (loadFromCSV leaves out empty cells), which get
// empty values, so that the values keep their columns when the CSV is
// parsed again (as when a project is loaded). Values under other keys follow.
function rowToCSV(row: TableRow): string {
    const values: TableCellValue[] = [];
    const otherValues: TableCellValue[] = [];
    for (const [key, value] of Object.entries(row)) {
        const index = getColumnIndex(key);
        if (index < 0) {
            otherValues.push(value);
        } else {
            values[index] = value;
        }
    }
    // Array.from() gives the missing columns as undefined
    return Array.from(values).concat(otherValues).map(toCSVValue).join(tableCSVDelimiter);
}

// The delimiter of a CSV file: a tab if there is one, else a semicolon, else
// a comma. Quoted values (which may hold any of them) are left out.
function detectCSVDelimiter(csv: string): string {
    const unquoted = csv.replace(/"[^"]*"/g, '');
    return unquoted.includes('\t') ? '\t' : unquoted.includes(';') ? ';' : ',';
}

function generateCSV(rowData: TableRow[]): string {
    return rowData.map(rowToCSV).join('\n');
}

export const useDataStore = defineStore('data', {
    state: (): DataState => ({
        tableCSV: '',
        tableRowData: [],
        tableHeaders: [],
        textDescription: '',
        selectedDataSource: 'table',
        spreadsheetSetupComplete: false,
        googleSpreadsheetURL: '',
        googleApiKey: '',
        googleAutoUpdateEnabled: false,
        googleAutoUpdateFrequency: 10,
        googleSheetStatus: GoogleSheetStatus.Loading,
        googleSheetErrorMessage: '',
        dataSourcesList: [
            { name: 'Grid', value: 'table' },
            { name: 'Google Sheets', value: 'googlesheets' },
        ],
    }),

    // The Vuex module also had a textDescription getter returning the state
    // value of the same name. Pinia stores share one namespace for state and
    // getters, so read the state directly.
    getters: {
        numRows: (state): number => {
            return state.tableRowData.length;
        },
        numCols: (state): number => {
            if (state.tableRowData.length > 0) {
                // Assuming all rows have the same number of columns
                return Object.keys(state.tableRowData[0]).length;
            }
            return 0;
        },
        tableColumnNamesWithData: (state): Array<string> => {
            const rows = state.tableRowData;
            const res: Record<string, string> = {};
            for (const row of rows) {
                const columns = Object.entries(row);
                for (const [col, val] of columns) {
                    if (typeof val !== 'undefined' && val !== null && (val + '').trim() !== '') {
                        res[col] = col;
                    }
                }
            }

            // In column order (A to Z, then AA, AB, ...), other keys after
            // them by name
            const getOrder = (columnName: string): number => {
                const index = getColumnIndex(columnName);
                return index < 0 ? Infinity : index;
            };
            return Object.keys(res).sort((a, b) =>
                getOrder(a) - getOrder(b) || (a < b ? -1 : a > b ? 1 : 0));
        },

        column: (state): ((key: string) => Array<TableCellValue>) => {
            return (key: string) => {
                return state.tableRowData.map((row) => row[key] ?? null);
            };
        },

        // Empty if the URL is not a spreadsheet URL. The URL is user input.
        googleSpreadsheetId: (state): string => {
            const regex = /docs\.google\.com\/spreadsheets\/d\/([-_.~a-zA-Z0-9]+)([/?#]|$)/;
            const match = state.googleSpreadsheetURL.match(regex);
            return match ? match[1] : '';
        },

        // The CSV is encoded as a URI component: encodeURI() leaves "#" as
        // it is, which would end the data at the first "#"
        tableCSVDataURI: (state): string => {
            return state.tableCSV ?
                'data:text/csv;charset=utf-8,' + encodeURIComponent(state.tableCSV) :
                '';
        },
    },

    actions: {
        // Restore the data and the data source settings from a project file
        // or a localStorage session, or without a state, reset them to the
        // placeholder data and the defaults. The Google API key is kept,
        // unless the state has one. The columns past Z of rows saved by
        // v1.2.1 and earlier are renamed AA, AB, ...
        restoreStoreState(newState?: DataRestoreState) {
            this.tableRowData = newState ?
                renameLegacyColumnIds(newState.tableRowData) :
                getPlaceholderData();
            this.textDescription = newState ? newState.textDescription || '' : '';
            this.tableCSV = generateCSV(this.tableRowData);

            const source = newState?.selectedDataSource;
            this.selectedDataSource = source && dataSources.includes(source) ? source : 'table';
            this.googleSpreadsheetURL = typeof newState?.googleSpreadsheetURL === 'string' ?
                newState.googleSpreadsheetURL :
                '';
            if (typeof newState?.googleApiKey === 'string') {
                this.googleApiKey = newState.googleApiKey;
            }
            this.googleAutoUpdateEnabled = newState?.googleAutoUpdateEnabled === true;
            const frequency = newState?.googleAutoUpdateFrequency;
            this.googleAutoUpdateFrequency = typeof frequency === 'number' && frequency > 0 ?
                frequency :
                10;
            // The sheet is fetched again, so its status starts over. A
            // project file opened without an API key in the editor starts
            // the setup over, at the API key, with the rest filled in.
            this.spreadsheetSetupComplete = newState?.spreadsheetSetupComplete === true &&
                this.selectedDataSource === 'googlesheets' &&
                !!this.googleApiKey &&
                !!this.googleSpreadsheetId;
            this.googleSheetStatus = GoogleSheetStatus.Loading;
            this.googleSheetErrorMessage = '';
        },

        setSelectedDataSource(source: string) {
            this.selectedDataSource = source;
        },

        setSpreadsheetSetupComplete(complete: boolean) {
            this.spreadsheetSetupComplete = complete;
        },

        setGoogleSpreadsheetURL(url: string) {
            this.googleSpreadsheetURL = url.trim();
        },

        setGoogleApiKey(key: string) {
            this.googleApiKey = key.trim();
        },

        setGoogleAutoUpdateEnabled(enabled: boolean) {
            this.googleAutoUpdateEnabled = enabled;
        },

        setGoogleSheetStatus(status: GoogleSheetStatus) {
            this.googleSheetStatus = status;
        },

        setGoogleSheetErrorMessage(message: string) {
            this.googleSheetErrorMessage = message;
        },

        setTableRowData(data: TableRow[]) {
            this.tableRowData = data;
            const csv = generateCSV(this.tableRowData);
            this.tableCSV = csv;
        },

        // Throws if the equation can not be parsed or evaluated, and leaves
        // the rows as they were
        fillColumn(fillData: FillColumnProps) {
            const col = fillData.columnName;
            const values = getFillValues(this.tableRowData, fillData.equation);

            this.tableRowData = this.tableRowData.map((row, rowIx) => {
                const value = values[rowIx];
                return value === undefined ? { ...row } : { ...row, [col]: value };
            });
            this.tableCSV = generateCSV(this.tableRowData);
        },

        addTableRows(numRows: number) {
            let i = numRows;
            while (i--) {
                this.tableRowData.push({});
            }
            this.tableCSV = generateCSV(this.tableRowData);
        },

        setToPlaceholderData() {
            this.tableRowData = getPlaceholderData();
            this.tableCSV = generateCSV(this.tableRowData);
        },

        setTextDescription(description: string) {
            this.textDescription = description;
        },

        // Load the rows from a CSV. The delimiter is detected, unless given:
        // the app's own CSV (tableCSV) is loaded with tableCSVDelimiter, as
        // it has none to detect with a single column.
        loadFromCSV(csv: string, delimiter = detectCSVDelimiter(csv)) {
            const arr = parseCSV(csv, delimiter);
            const maxRowLen = arr.reduce((len: number, row): number => {
                return Math.max(len, row.length);
            }, 0);

            const columnIds = getGridColumnIds(maxRowLen);

            // No cells for empty values
            const objectifiedArr = arr.map((row: string[]) => {
                const rowObject: TableRow = {};
                row.forEach((cell: string, i: number) => {
                    if (cell) {
                        rowObject[columnIds[i]] = cell;
                    }
                });
                return rowObject;
            });

            this.setTableRowData(objectifiedArr);
        },
    },
});
