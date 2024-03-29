<template>
    <div class="se-grid-container">
        <ag-grid-vue
            ref="grid"
            class="se-grid ag-theme-balham"
            :grid-options="gridOptions"
            :column-defs="columnDefs"
            :row-data="tableRowData"
        />
    </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { AgGridVue } from 'ag-grid-vue';
import {
    Column, RowNode, GridApi, ColumnApi, GridOptions,
    CellValueChangedEvent, ShouldRowBeSkippedParams
} from 'ag-grid-community';


function getColumnIDsWithData(gridAPI: GridApi, columnAPI: ColumnApi): string[] {
    const allColumns = columnAPI.getAllGridColumns();

    return allColumns.filter(
        (column: Column): boolean => {
            let hasData = false;

            gridAPI.forEachNodeAfterFilter((rowNode: RowNode) => {
                hasData = hasData || !!gridAPI.getValue(column.getColId(), rowNode);
            });

            return hasData;
        }
    ).map((column: Column) => column.getColId());
}


function hasRowData(rowNode: RowNode) {
    const rowData = rowNode.data;
    return !!Object.keys(rowData).length;
}


function stringCompare(a: string, b: string): number {
    return b.localeCompare(a);
}


function numCompare(a: number, b: number): number {
    return b - a;
}


function columnSortComparator(a?: string, b?: string): number {
    if (typeof a === 'undefined' || typeof b === 'undefined') {
        return 0;
    }

    if (isNaN(a as any) || isNaN(b as any)) {
        return stringCompare(a, b);
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);
    return numCompare(numA, numB);
}


export default {
    components: {
        AgGridVue
    },
    data() {
        return {
            gridOptions: {
                singleClickEdit: true,
                headerHeight: 25,
                stopEditingWhenCellsLoseFocus: true,
                suppressScrollOnNewData: true,
                onCellValueChanged: (e: CellValueChangedEvent) => (this as any).onCellValueChanged(e),
                onFirstDataRendered: () => (this as any).updateCSVInDataStore(),
                onComponentStateChanged: () => (this as any).updateCSVInDataStore(),
                postSort: () => (this as any).updateCSVInDataStore(),
                defaultColDef: {
                    sortable: true,
                    comparator: columnSortComparator,
                    filter: true,
                    editable: true
                },

                // A11y concerns:
                suppressMenuHide: true, // Always show column menu
                suppressColumnVirtualisation: true, // Always render all columns in DOM
                ensureDomOrder: true,
                rowBuffer: 200 // Render this many rows regardless of what is in view
            },
            columnDefs: [{}],
            rowData: [{}]
        };
    },
    computed: mapState('dataStore', ['tableRowData']),
    beforeMount(): void {
        this.columnDefs = this.makeColumns();
    },
    methods: {
        // Ensure source data for the grid is always up to date with current values.
        onCellValueChanged(e: CellValueChangedEvent): void {
            const oldVal = e.oldValue || '';
            const newVal = e.newValue || '';
            if (oldVal !== newVal) {
                this.$store.commit('dataStore/updateCellValue', {
                    rowIndex: e.rowIndex,
                    columnName: e.colDef.field,
                    value: e.value || null
                });
            }
        },

        makeColumns(): Array<object> {
            const codeToChar = (i: number) => String.fromCharCode(65 + i),
                res = [];

            for (let i = 0; i < 11; ++i) {
                res.push({
                    headerName: codeToChar(i),
                    field: codeToChar(i),
                    cellStyle: { textAlign: 'center' }
                });
            }

            return res;
        },

        scrollToLastGridRowWithData() {
            const gridApi: any = (this.$refs.grid as any)?.gridOptions?.api;

            if (gridApi) {
                const rows: Array<boolean> = [];
                gridApi.forEachNode((node: RowNode) => rows.push(hasRowData(node)));

                const lastRowWithDataIndex = rows.lastIndexOf(true);
                if (lastRowWithDataIndex > -1) {
                    gridApi.ensureIndexVisible(lastRowWithDataIndex, 'top');
                }
            }
        },

        // Is the first column text?
        columnType(column: Array<string|null>, rowsToCheck: number): 'number'|'string'|'date'|'empty' {
            const len = Math.min(rowsToCheck, column.length);
            let hasData = false;
            for (let i = 1; i < len; ++i) { // Do not check first row, because of column headers
                const val = column[i];
                hasData = hasData || !!(val?.trim().length);
                if (
                    val !== null &&
                    (isNaN(val as any) || isNaN(parseFloat(val)))
                ) {
                    return isNaN(Date.parse(val)) ? 'string' : 'date';
                }
            }
            return hasData ? 'number' : 'empty';
        },

        // Update the CSV render of the table data in the data store.
        updateCSVInDataStore() {
            const grid: any = this.$refs.grid;
            const gridOptions: GridOptions = grid?.gridOptions;
            const gridAPI = gridOptions?.api;
            const columnAPI = gridOptions?.columnApi;

            if (gridAPI && columnAPI) {
                const columnsToExport = getColumnIDsWithData(gridAPI, columnAPI);

                const csv = columnsToExport.length ? (gridAPI as any).getDataAsCsv({
                    columnKeys: columnsToExport,
                    suppressQuotes: true,
                    shouldRowBeSkipped: (params: ShouldRowBeSkippedParams): boolean => {
                        return !hasRowData(params.node);
                    },
                    skipColumnHeaders: true,
                    columnSeparator: ';',
                    // Replace ; in the cells with space for the CSV to avoid accidental delimitors.
                    processCellCallback: (params: any): string => {
                        return params?.value?.replace(/;/g, ' ');
                    }
                }) : '';

                this.$store.commit('dataStore/setTableCSV', csv);

                const firstColumn = this.$store.getters['dataStore/column']('A');
                const xAxisType = this.$store.state.chartParametersStore.xAxisType;
                const colType = this.columnType(firstColumn, 500);
                if (colType === 'string' && xAxisType !== 'datetime') {
                    this.$store.commit('chartParametersStore/setXAxisType', 'category');
                } else if (colType === 'date' && xAxisType !== 'category') {
                    this.$store.commit('chartParametersStore/setXAxisType', 'datetime');
                } else if (firstColumn.length < 500 && colType === 'empty' && xAxisType !== 'logarithmic') {
                    this.$store.commit('chartParametersStore/setXAxisType', 'linear');
                }
            }
        }
    }
};
</script>

<style lang="scss">
    $header-background-color: #eef1f8;
    $header-foreground-color: #616161;
    $header-cell-hover-background-color: #e0e2eb;
    $odd-row-background-color: #fff;
    $border-color: #d5d3d3;
    $row-border-color: #d5d3d3;
    $cell-horizontal-border: solid 0.5px #e3e0e0;
    $hover-color: #f1f4f9;
    $background-color: #fff;
    $font-family: 'Roboto';
    $font-size: 0.875rem;
    $secondary-font-size: 0.7625rem;
    $secondary-font-weight: normal;
    $secondary-font-family: 'Roboto';

    @import "../../../../node_modules/ag-grid-community/src/styles/ag-grid.scss";
    @import "../../../../node_modules/ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";

    .ag-header-cell-label {
        justify-content: center;
        padding-left: 15px;
    }

    .ag-cell-edit-input {
        padding: 2px 6px;
        text-align: center;
    }

    .ag-row-first {
        font-weight: bold;
    }

    .se-grid, .se-grid-container {
        width: 100%;
        height: 100%;
    }
</style>
