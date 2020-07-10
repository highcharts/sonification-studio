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

interface UpdateCellDataProps {
    rowIndex: number;
    columnName: string;
    value: any;
}

export const dataStore = {
    namespaced: true,

    state: {
        tableCSV: '',
        tableRowData: [] // Source data for table
    },

    getters: {
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
        }
    },

    mutations: {
        setTableCSV(state: any, csv: string) {
            state.tableCSV = csv;
        },

        setTableRowData(state: any, data: Array<unknown>) {
            Vue.set(state, 'tableRowData', data);
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
        }
    },

    actions: {
        loadFromCSV({ commit }: any, csv: string) {
            const hasTab = csv.indexOf('\t') > -1;
            const hasSemicolon = csv.indexOf(';') > -1;
            const delim = hasTab ? '\t' : hasSemicolon ? ';' : ',';
            const arr = parseCSV(csv, delim);
            const firstRowHasNames = !(arr[0]).some(cell => !isNaN(+cell));

            let firstRow: string[];
            if (firstRowHasNames) {
                firstRow = arr.shift() || []; // Remove first row
            } else {
                firstRow = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, arr[0].length).split('');
            }

            const objectifiedArr = arr.map((row: string[]) => {
                const rowObject: any = {};
                row.forEach((cell: string, i: number) => {
                    if (cell) {
                        const columnName = firstRow[i] || '_';
                        rowObject[columnName] = cell;
                    }
                });
                return rowObject;
            });

            commit('setTableRowData', objectifiedArr);
        }
    }
};
