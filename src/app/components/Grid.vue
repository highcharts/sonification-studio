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
            :single-click-edit="true"
            :stop-editing-when-grid-loses-focus="true"
            :suppress-menu-hide="true"
            :suppress-column-virtualisation="true"
            :ensure-dom-order="true"
            :row-buffer="400"
            :column-defs="columnDefs"
            :row-data="rowData"
        />
    </div>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';

export default {
    components: {
        AgGridVue
    },
    data() {
        return {
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
            const gridOptions = grid?.gridOptions;
            const api = gridOptions?.api;

            if (api) {
                api.ensureIndexVisible(0);

                const firstCol = gridOptions.columnApi.getAllDisplayedColumns()[0];
                api.ensureColumnVisible(firstCol);

                api.setFocusedCell(0, firstCol);
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
    }

    .se-grid, .se-grid-container {
        width: 100%;
        height: 100%;
    }
</style>
