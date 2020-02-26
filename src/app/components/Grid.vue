<template>
    <div
        class="se-grid-container"
        tabindex="0"
        @keyup.enter="focusGrid"
        @keyup.esc="unfocusGrid"
    >
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
                stopEditingWhenGridLosesFocus: true,
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
    beforeMount: function (): void {
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

            for (let i = 0; i < 26; ++i) {
                res.push({
                    headerName: codeToChar(i),
                    field: codeToChar(i),
                    cellStyle: { textAlign: 'center' }
                });
            }

            return res;
        },

        focusGrid() {
            const grid: any = this.$refs.grid;
            const gridOptions: GridOptions = grid?.gridOptions;
            const gridApi = gridOptions?.api;
            const columnApi = gridOptions?.columnApi;
            const tableRows = this.$store.state.dataStore.tableRowData;

            if (gridApi && columnApi && tableRows.length) {
                const focusedCell = gridApi.getFocusedCell();
                const rowToFocus = (focusedCell?.rowIndex ?? -1) + 1;
                const columnToFocus = focusedCell?.column || columnApi.getAllGridColumns()[0];

                if (tableRows.length > rowToFocus) {
                    gridApi.ensureIndexVisible(rowToFocus);
                    gridApi.ensureColumnVisible(columnToFocus);
                    gridApi.setFocusedCell(rowToFocus, columnToFocus);
                }
            }
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

        unfocusGrid() {
            const el: any = this.$el;
            el.focus();
        },

        // Update the CSV render of the table data in the data store.
        updateCSVInDataStore() {
            const grid: any = this.$refs.grid;
            const gridOptions: GridOptions = grid?.gridOptions;
            const gridAPI = gridOptions?.api;
            const columnAPI = gridOptions?.columnApi;

            if (gridAPI && columnAPI) {
                const columnsToExport = getColumnIDsWithData(gridAPI, columnAPI);

                const csv = columnsToExport.length ? gridAPI.getDataAsCsv({
                    columnKeys: columnsToExport,
                    suppressQuotes: true,
                    shouldRowBeSkipped: (params: ShouldRowBeSkippedParams): boolean => {
                        return !hasRowData(params.node);
                    },
                    skipHeader: true,
                    columnSeparator: ';',
                    // Replace ; in the cells with space for the CSV to avoid accidental delimitors.
                    processCellCallback: (params: any): string => {
                        return params?.value?.replace(/;/g, ' ');
                    }
                }) : '';

                this.$store.commit('dataStore/setTableCSV', csv);
            }
        }
    }
};
</script>

<style lang="scss">
    $header-background-color: #9BA3B4;
    $header-foreground-color: #fff;
    $header-cell-hover-background-color: #a3adc2;
    $odd-row-background-color: rgb(239, 239, 248);
    $hover-color: hsl(218, 42%, 96%);
    $background-color: #fff;
    $border-color: #f0f0f0;
    $font-family: 'Roboto';
    $font-size: 14px;
    $secondary-font-size: 17px;
    $secondary-font-weight: normal;
    $secondary-font-family: 'Roboto';
    $secondary-foreground-color-opacity: 0.7;

    @import "../../../node_modules/ag-grid-community/src/styles/ag-grid.scss";
    @import "../../../node_modules/ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";

    .ag-header-cell-label {
        justify-content: center;
        padding-left: 15px;
    }

    .ag-cell-edit-input {
        padding: 2px 6px;
        text-align: center;
    }

    .se-grid, .se-grid-container {
        width: 100%;
        height: 100%;
    }
</style>
