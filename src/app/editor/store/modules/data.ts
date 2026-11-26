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
import { evaluate } from 'mathjs';

// Value of one grid cell. Usually a string, but the grid and project files
// can hold other primitives.
export type TableCellValue = string | number | boolean | null;

// One grid row: column name ('A' to 'Z', then 'COL1', 'COL2', ...) -> cell value.
// Row 0 holds the column headers.
export type TableRow = Record<string, TableCellValue>;

export interface UpdateCellDataProps {
    rowIndex: number;
    columnName: string;
    value: TableCellValue;
}

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
// localStorage sessions.
export interface DataRestoreState {
    tableRowData: TableRow[];
    textDescription?: string;
}

function getFillValue(row: TableRow, rowIx: number, fillData: FillColumnProps): string {
    return (
        '' +
        evaluate(fillData.equation, {
            i: rowIx,
            ...row,
        })
    );
}

function getPlaceholderData(): Array<Record<string, string>> {
    const columns: string[] = [];

    // Generate A-Z column names
    for (let i = 0; i < 26; i++) {
        columns.push(String.fromCharCode(65 + i));
    }

    const data: Array<Record<string, string>> = [];

    // Header row
    const headerRow: Record<string, string> = {
        A: 'Index (X value)',
        B: 'Sensor Data (Y value)',
    };
    columns.slice(2).forEach((col) => {
        headerRow[col] = ''; // Leave rest of headers blank
    });
    data.push(headerRow);

    // 199 data rows
    for (let i = 0; i < 199; i++) {
        const row: Record<string, string> = {
            A: '' + i,
            B: ((Math.sin(i / 3) * i) / 2).toFixed(3),
        };
        columns.slice(2).forEach((col) => {
            row[col] = ''; // fill C-Z with blank
        });
        data.push(row);
    }

    return data;
}

// Index of a column name ('A' is 0, 'Z' 25, 'COL1' 26, ...), or -1 for
// another key
function getColumnIndex(columnName: string): number {
    if (/^[A-Z]$/.test(columnName)) {
        return columnName.charCodeAt(0) - 65;
    }
    const match = /^COL([1-9]\d*)$/.exec(columnName);
    return match ? 25 + Number(match[1]) : -1;
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
    // Array.from() gives the missing columns as undefined, and join() writes
    // undefined and null as empty values
    return Array.from(values).concat(otherValues).join(';');
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

            return Object.keys(res).sort();
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

        tableCSVDataURI: (state): string => {
            return state.tableCSV ? encodeURI(`data:text/csv;charset=utf-8,${state.tableCSV}`) : '';
        },
    },

    actions: {
        restoreStoreState(newState?: DataRestoreState) {
            this.tableRowData = newState ? newState.tableRowData : getPlaceholderData();
            this.textDescription = newState ? newState.textDescription || '' : '';
            this.tableCSV = generateCSV(this.tableRowData);
        },

        setTableCSV(csv: string) {
            this.tableCSV = csv;
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

        fillColumn(fillData: FillColumnProps) {
            const rowData = this.tableRowData;
            const col = fillData.columnName;
            const newRows: TableRow[] = [];

            rowData.forEach((row, rowIx): void => {
                const newRow = { ...row };
                if (rowIx) {
                    newRow[col] = getFillValue(newRow, rowIx, fillData);
                }
                newRows.push(newRow);
            });

            this.tableRowData = newRows;
            this.tableCSV = generateCSV(this.tableRowData);
        },

        updateCellValue(cellData: UpdateCellDataProps) {
            const rowData = this.tableRowData;
            const row = rowData[cellData.rowIndex];
            const column = cellData.columnName;

            const newRow = { ...row };
            newRow[column] = cellData.value;

            rowData.splice(cellData.rowIndex, 1, newRow);

            const newCSV = generateCSV(this.tableRowData);

            this.tableCSV = newCSV;
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

        loadFromCSV(csv: string) {
            const hasTab = csv.indexOf('\t') > -1;
            const hasSemicolon = csv.indexOf(';') > -1;
            const delim = hasTab ? '\t' : hasSemicolon ? ';' : ',';
            const arr = parseCSV(csv, delim);
            const maxRowLen = arr.reduce((len: number, row): number => {
                return Math.max(len, row.length);
            }, 0);

            const columnHeaders: string[] = [];
            for (let i = 0; i < maxRowLen; i++) {
                columnHeaders.push(i < 26 ? String.fromCharCode(65 + i) : `COL${i - 25}`);
            }

            const objectifiedArr = arr.map((row: string[]) => {
                const rowObject: TableRow = {};
                row.forEach((cell: string, i: number) => {
                    if (cell) {
                        const columnName = columnHeaders[i] || '_';
                        rowObject[columnName] = cell;
                    }
                });
                return rowObject;
            });

            this.setTableRowData(objectifiedArr);
        },
    },
});
