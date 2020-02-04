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
    }
};
