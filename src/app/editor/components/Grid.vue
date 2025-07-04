<template>
    <div class="se-grid-container">
        <div ref="gridContainer" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState } from 'vuex';
import { grid as createGrid } from '@highcharts/dashboards/datagrid';
import '@highcharts/dashboards/css/datagrid.css';

@Component({
    computed: {
        ...mapState('dataStore', ['tableRowData']),
    },
})
export default class GridProStandalone extends Vue {
    gridInstance: any = null;
    resizeObserver: ResizeObserver | null = null;

    tableRowData!: Array<Record<string, any>>;
    $refs!: { gridContainer: HTMLElement };

    mounted() {
        if (!this.tableRowData?.length) {
            this.$store.commit('dataStore/setToPlaceholderData');
            this.$nextTick(() => {
                this.observeAndRenderWhenVisible(this.$store.state.dataStore.tableRowData);
            });
        } else {
            this.observeAndRenderWhenVisible(this.tableRowData);
        }

        this.$watch(
            () => this.tableRowData.length,
            (newLength, oldLength) => {
                if (newLength !== oldLength) {
                    this.observeAndRenderWhenVisible(this.tableRowData);
                }
            }
        );
    }

    beforeDestroy() {
        if (this.gridInstance?.destroy) {
            this.gridInstance.destroy();
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    observeAndRenderWhenVisible(data: Array<Record<string, any>>) {
        const container = this.$refs.gridContainer as HTMLElement;
        if (!container || typeof ResizeObserver === 'undefined') {
            this.renderGrid(data);
            return;
        }

        if (this.gridInstance) {
            this.gridInstance.destroy();
            this.gridInstance = null;
        }

        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 50 && height > 50) {
                    this.resizeObserver?.disconnect();
                    this.renderGrid(data);
                    break;
                }
            }
        });

        this.resizeObserver.observe(container);
    }

    renderGrid(data: Array<Record<string, any>>) {
        const container = this.$refs.gridContainer as HTMLElement;
        if (!container) return;

        const columnCount = 50;
        const columnKeys = Array.from(
            { length: columnCount },
            (_, i) =>
                String.fromCharCode(65 + (i % 26)) +
                (i >= 26 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) : '')
        );

        const keysInData = Object.keys(data[0] || {});
        const isHeaderRow = keysInData.every((k) => typeof data[0][k] === 'string');
        const header = isHeaderRow ? data[0] : {};
        const bodyData = isHeaderRow ? data.slice(1) : data;

        const paddedData = bodyData.map((row) => {
            const newRow: Record<string, any> = {};
            columnKeys.forEach((key) => {
                newRow[key] = row[key] ?? '';
            });
            return newRow;
        });

        const columns: Record<string, any[]> = {};
        columnKeys.forEach((key) => {
            columns[key] = paddedData.map((row) => row[key]);
            columns[key].unshift(header[key] || '');
        });

        const config = {
            dataTable: { columns },
            columnDefaults: {
                cells: {
                    editable: true,
                    className: 'hcg-center',
                },
            },
            rendering: {
                theme: 'hcg-theme-default',
                containerHeight: '100%',
                containerWidth: '100%',
                rows: {
                    bufferSize: 10,
                    strictHeights: false,
                },
            },
            events: {
                cell: {
                    afterEdit: () => {
                        this.updateCSVFromGrid();
                    },
                },
            },
            columns: columnKeys.map((key) => ({
                id: key,
                title: key,
                editable: true,
                ...(key === 'metaData' ? { enabled: false } : {}),
            })),
        };

        if (this.gridInstance) {
            this.gridInstance.destroy();
        }

        this.gridInstance = createGrid(container, config);
        this.updateCSVFromGrid();
    }

    updateCSVFromGrid() {
        if (!this.gridInstance?.dataTable) return;

        const dataTable = this.gridInstance.dataTable;
        const rowCount = dataTable.rowCount;
        const columnIds = Object.keys(dataTable.columns || {});

        const nonEmptyCols = columnIds.filter((colId) => {
            for (let i = 1; i < rowCount; i++) {
                const value = dataTable.getCell(colId, i);
                if (value !== '' && value != null) {
                    return true;
                }
            }
            return false;
        });

        if (nonEmptyCols.length === 0) {
            this.$store.commit('dataStore/setTableCSV', '');
            return;
        }

        const headerLine = nonEmptyCols.join(';');
        const lines = [];

        for (let i = 1; i < rowCount; i++) {
            const row = nonEmptyCols.map((colId) => {
                const value = dataTable.getCell(colId, i);
                return ('' + (value ?? '')).replace(/;/g, ' ');
            });
            lines.push(row.join(';'));
        }

        const csv = [headerLine, ...lines].join('\n');
        this.$store.commit('dataStore/setTableCSV', csv);
    }

    scrollToLastGridRowWithData() {
        if (!this.gridInstance || !this.gridInstance.dataTable) return;

        const rowCount = this.gridInstance.dataTable.rowCount;

        // Find the last row with content
        let lastRowWithDataIndex = -1;
        for (let i = rowCount - 1; i >= 0; --i) {
            const row = this.gridInstance.dataTable.getRow(i);
            const hasData = Object.values(row).some((val) => val !== '' && val != null);
            if (hasData) {
                lastRowWithDataIndex = i;
                break;
            }
        }

        if (lastRowWithDataIndex === -1) return;

        const container = this.$refs.gridContainer as HTMLElement;
        const tbody = container.querySelector('.highcharts-datagrid-row')?.parentElement;

        if (!tbody) return;

        const targetRow = tbody.children[lastRowWithDataIndex] as HTMLElement;
        if (targetRow) {
            targetRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
</script>

<style>
.se-grid-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px dashed #ccc;
}

.se-grid-container > div {
    flex-grow: 1;
    overflow-x: auto;
    overflow-y: auto;
    min-height: 300px;
}

.hcg-center,
.highcharts-datagrid-header-cell {
    min-width: 120px !important;
    max-width: 120px !important;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.highcharts-datagrid-table {
    width: max-content !important;
}
</style>
