
export const dataStore = {
    namespaced: true,

    state: {
        tableCSV: ''
    },

    mutations: {
        setTableCSV(state: any, csv: string) {
            state.tableCSV = csv;
        }
    }
};
