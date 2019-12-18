<template>
    <ag-grid-vue
        class="se-grid ag-theme-balham"
        suppress-menu-hide="true"
        :column-defs="columnDefs"
        :row-data="rowData"
    />
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

    .se-grid {
        width: 100%;
        height: 100%;
    }
</style>
