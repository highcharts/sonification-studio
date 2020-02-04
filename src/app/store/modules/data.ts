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
        tableRowData: []
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
        }
    }
};
