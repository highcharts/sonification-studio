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
            :row-data="rowData"
        />
    </div>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import {
    CellValueChangedEvent, Column, RowNode, GridApi, ColumnApi, GridOptions
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

export default {
    components: {
        AgGridVue
    },
    data() {
        return {
            gridOptions: {
                singleClickEdit: true,
                stopEditingWhenGridLosesFocus: true,
                suppressMenuHide: true,
                suppressColumnVirtualisation: true,
                ensureDomOrder: true,
                rowBuffer: 200,
                onCellValueChanged: (e: CellValueChangedEvent) => {
                    const gridAPI = e.api;
                    const columnsToExport = getColumnIDsWithData(gridAPI, e.columnApi);
                    const csv = gridAPI.getDataAsCsv({
                        columnKeys: columnsToExport,
                        suppressQuotes: true,
                        columnSeparator: ';',
                        // Replace ; in the cells with space for the CSV.
                        processCellCallback: (params: any): string => {
                            return params?.value?.replace(/;/g, ' ') ?? null;
                        }
                    });

                    this.$store.commit('dataStore/setTableCSV', csv);
                }
            },
            columnDefs: [{}],
            rowData: [{}]
        };
    },
    beforeMount: function (): void {
        this.columnDefs = this.makeColumns();
        this.rowData = this.makeFakeRows();
    },
    methods: {
        makeColumns(): Array<object> {
            const codeToChar = (i: number) => String.fromCharCode(65 + i),
                res = [];

            for (let i = 0; i < 26; ++i) {
                res.push({
                    headerName: codeToChar(i),
                    field: codeToChar(i),
                    sortable: true,
                    filter: true,
                    editable: true,
                    cellStyle: { textAlign: 'center' }
                });
            }

            return res;
        },

        makeFakeRows(): Array<object> {
            const res = [];

            for (let i = 0; i < 26; ++i) {
                res.push({
                    A: '' + i,
                    B: Math.random().toFixed(2)
                });
            }

            return res;
        },

        focusGrid() {
            const grid: any = this.$refs.grid;
            const gridOptions: GridOptions = grid?.gridOptions;
            const gridApi = gridOptions?.api;
            const columnApi = gridOptions?.columnApi;

            if (gridApi && columnApi) {
                const focusedCell = gridApi.getFocusedCell();
                const rowToFocus = (focusedCell?.rowIndex ?? -1) + 1;
                const columnToFocus = focusedCell.column || columnApi.getAllGridColumns()[0];

                gridApi.ensureIndexVisible(rowToFocus);
                gridApi.ensureColumnVisible(columnToFocus);
                gridApi.setFocusedCell(rowToFocus, columnToFocus);
            }
        },

        unfocusGrid() {
            const el: any = this.$el;
            el.focus();
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
