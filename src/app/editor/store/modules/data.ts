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

import Vue from 'vue';
import { parseCSV } from '../../core/utils/csvParser';
import { GenericObject } from '../../core/utils/objects';
import { evaluate } from 'mathjs';

interface UpdateCellDataProps {
    rowIndex: number;
    columnName: string;
    value: any;
}

interface FillColumnProps {
    columnName: string;
    equation: string;
}

export enum GoogleSheetStatus {
    Loading = 0,
    Success,
    Error
}

function getFillValue(row: GenericObject, rowIx: number, fillData: FillColumnProps): string {
    return '' + evaluate(fillData.equation, {
        i: rowIx,
        ...row
    });
}

function getPlaceholderData() {
    const res = [{ A: 'Index (X value)', B: 'Sensor Data (Y value)', C: 'Low Value', D: 'High Value' }];

    for (let i = 0; i < 5; ++i) {
        const B = (Math.sin(i / 3) * i / 2);
        const C = (B * (0.85 + Math.random() * 0.14)).toFixed(3); // Randomly between 85% to 99% of B
        const D = (B * (1.03 + Math.random() * 0.12)).toFixed(3); // Randomly between 103% to 115% of B
        const bValue = B.toFixed(3);
        res.push({
            A: '' + i,
            B: bValue,
            C: C,
            D: D
        });
    }

    return res;
}


export const dataStore = {
    namespaced: true,

    state: {
        tableCSV: '',
        tableRowData: [], // Source data for table
        textDescription: '', // Text description for the table/chart
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
            { name: 'Google Sheets', value: 'googlesheets' }
        ]
    },

    getters: {
        numRows: (state: GenericObject): number => {
            return state.tableRowData.length;
        },

        tableRowData: (state: GenericObject): number => {
            return state.tableRowData.length;
        },

        tableColumnNamesWithData: (state: GenericObject): Array<string> => {
            const rows = state.tableRowData;
            const res: GenericObject = {};
            for (const row of rows) {
                const columns = Object.entries(row);
                for (const [col, val] of columns) {
                    if (
                        typeof val !== 'undefined' &&
                        val !== null &&
                        (val + '').trim() !== ''
                    ) {
                        res[col] = col;
                    }
                }
            }

            return Object.keys(res).sort();
        },

        column: (state: GenericObject): (key: string) => Array<unknown> => {
            return (key: string) => {
                return state.tableRowData
                    .map((row: GenericObject) => row[key] ?? null);
            };
        },

        googleSpreadsheetId: (state: GenericObject): string => {
            const regex = /docs\.google\.com\/spreadsheets\/d\/([-_.~a-zA-Z0-9]+)(\/|$)/;
            return state.googleSpreadsheetURL && state.googleSpreadsheetURL.match(regex)[1];
        },

        tableCSVDataURI: (state: GenericObject): string => {
            return state.tableCSV ? encodeURI(`data:text/csv;charset=utf-8,${state.tableCSV}`) : '';
        },

        textDescription: (state: GenericObject): string => {
            return state.textDescription;
        }
    },

    mutations: {
        // Apply a state or replace state with placeholder data.
        restoreStoreState(state: any, newState?: GenericObject) {
            Vue.set(state, 'tableRowData', newState ? newState.tableRowData : getPlaceholderData());
            state.textDescription = newState ? (newState.textDescription || '') : '';
        },

        setTableCSV(state: any, csv: string) {
            state.tableCSV = csv;
        },

        setSelectedDataSource(state: any, source: string) {
            state.selectedDataSource = source;
        },

        setSpreadsheetSetupComplete(state: any, complete: boolean) {
            state.spreadsheetSetupComplete = complete;
        },

        setGoogleSpreadsheetURL(state: any, url: string) {
            state.googleSpreadsheetURL = url.trim();
        },

        setGoogleApiKey(state: any, key: string) {
            state.googleApiKey = key.trim();
        },

        setGoogleAutoUpdateEnabled(state: any, enabled: boolean) {
            state.googleAutoUpdateEnabled = enabled;
        },

        setGoogleSheetStatus(state: any, status: GoogleSheetStatus) {
            state.googleSheetStatus = status;
        },

        setGoogleSheetErrorMessage(state: any, message: GoogleSheetStatus) {
            state.googleSheetErrorMessage = message;
        },

        setTableRowData(state: any, data: Array<unknown>) {
            Vue.set(state, 'tableRowData', data);
        },

        fillColumn(state: any, fillData: FillColumnProps) {
            const rowData = state.tableRowData;
            const col = fillData.columnName;
            const newRows: Array<GenericObject> = [];

            rowData.forEach((row: GenericObject, rowIx: number): void => {
                const newRow = { ...row };
                if (rowIx) { // Don't fill column with headers
                    newRow[col] = getFillValue(newRow, rowIx, fillData);
                }
                newRows.push(newRow);
            });

            Vue.set(state, 'tableRowData', newRows);
        },

        updateCellValue(state: any, cellData: UpdateCellDataProps) {
            const rowData = state.tableRowData;
            const row = rowData[cellData.rowIndex];
            const column = cellData.columnName;

            const newRow = { ...row };
            newRow[column] = cellData.value;

            rowData.splice(cellData.rowIndex, 1, newRow);
        },

        addTableRows(state: any, numRows: number) {
            let i = numRows;
            while (i--) {
                state.tableRowData.push({});
            }
        },

        setToPlaceholderData(state: any) {
            Vue.set(state, 'tableRowData', getPlaceholderData());
        },

        setTextDescription(state: any, description: string) {
            state.textDescription = description;
        }
    },

    actions: {
        loadFromCSV({ commit }: any, csv: string) {
            const hasTab = csv.indexOf('\t') > -1;
            const hasSemicolon = csv.indexOf(';') > -1;
            const delim = hasTab ? '\t' : hasSemicolon ? ';' : ',';
            const arr = parseCSV(csv, delim);
            const maxRowLen = arr.reduce((len: number, row): number => {
                return Math.max(len, row.length);
            }, 0);
            const columnHeaders = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, maxRowLen).split('');

            const objectifiedArr = arr.map((row: string[]) => {
                const rowObject: any = {};
                row.forEach((cell: string, i: number) => {
                    if (cell) {
                        const columnName = columnHeaders[i] || '_';
                        rowObject[columnName] = cell;
                    }
                });
                return rowObject;
            });

            commit('setTableRowData', objectifiedArr);
        }
    }
};
