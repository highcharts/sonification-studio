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

function getFillValue(row: GenericObject, rowIx: number, fillData: FillColumnProps): string {
    return '' + evaluate(fillData.equation, {
        i: rowIx,
        ...row
    });
}

function getPlaceholderData() {
    const res = [];

    for (let i = 0; i < 175; ++i) {
        res.push({
            A: '' + i,
            B: (Math.sin(i / 3) * i / 2).toFixed(3)
        });
    }

    return res;
}


export const dataStore = {
    namespaced: true,

    state: {
        tableCSV: '',
        tableRowData: [] // Source data for table
    },

    getters: {
        numRows: (state: GenericObject): number => {
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

        tableCSVDataURI: (state: GenericObject): string => {
            return state.tableCSV ? encodeURI(`data:text/csv;charset=utf-8,${state.tableCSV}`) : '';
        }
    },

    mutations: {
        // Apply a state or replace state with placeholder data.
        restoreStoreState(state: any, newState?: GenericObject) {
            Vue.set(state, 'tableRowData', newState ? newState.tableRowData : getPlaceholderData());
        },

        setTableCSV(state: any, csv: string) {
            state.tableCSV = csv;
        },

        setTableRowData(state: any, data: Array<unknown>) {
            Vue.set(state, 'tableRowData', data);
        },

        fillColumn(state: any, fillData: FillColumnProps) {
            const rowData = state.tableRowData;
            const col = fillData.columnName;
            const newRows: Array<GenericObject> = [];

            try {
                rowData.forEach((row: GenericObject, rowIx: number): void => {
                    const newRow = { ...row };
                    newRow[col] = getFillValue(newRow, rowIx, fillData);
                    newRows.push(newRow);
                });

                Vue.set(state, 'tableRowData', newRows);
            } catch (e) {
                alert('Error filling column: ' + e.message);
            }
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
        }
    },

    actions: {
        loadFromCSV({ commit }: any, csv: string) {
            const hasTab = csv.indexOf('\t') > -1;
            const hasSemicolon = csv.indexOf(';') > -1;
            const delim = hasTab ? '\t' : hasSemicolon ? ';' : ',';
            const arr = parseCSV(csv, delim);
            const firstRowHasNames = !(arr[0]).some(cell => !isNaN(+cell));
            const maxRowLen = arr.reduce((len: number, row): number => {
                return Math.max(len, row.length);
            }, 0);
            const columnHeaders = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, maxRowLen).split('');

            if (firstRowHasNames) {
                arr.shift(); // Remove first row
            }

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
