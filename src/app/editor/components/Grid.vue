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
        ...mapState('viewStore', ['selectedHeaderTabContent']),
    },
})
export default class GridProStandalone extends Vue {
    gridInstance: any = null;
    resizeObserver: ResizeObserver | null = null;
    isUpdatingFromGrid = false;

    tableRowData!: Array<Record<string, any>>;
    selectedHeaderTabContent!: string;
    $refs!: { gridContainer: HTMLElement };

    mounted() {
        console.log('Grid component mounted');
        console.log('tableRowData in mounted:', this.tableRowData);
        console.log('Store tableRowData in mounted:', this.$store.state.dataStore.tableRowData);

        // Check if there's data in the store, don't reset to placeholder if there's real data
        const storeData = this.$store.state.dataStore.tableRowData;
        if (!this.tableRowData?.length && !storeData?.length) {
            console.log('No data found, setting placeholder data');
            this.$store.commit('dataStore/setToPlaceholderData');
            this.$nextTick(() => {
                this.observeAndRenderWhenVisible(this.$store.state.dataStore.tableRowData);
            });
        } else {
            console.log('Using existing data');
            // Use store data if available, fallback to component data
            const dataToUse = storeData?.length ? storeData : this.tableRowData;
            this.observeAndRenderWhenVisible(dataToUse);
        }

        // Watch for changes in row count to trigger grid re-render (adding or removing rows)
        this.$watch(
            () => this.tableRowData.length,
            (newLength, oldLength) => {
                // Allow re-render if not currently updating from grid
                if (newLength !== oldLength && !this.isUpdatingFromGrid) {
                    console.log('Length changed, re-rendering grid:', newLength, oldLength);
                    this.observeAndRenderWhenVisible(this.tableRowData);
                }
            }
        );

        // Watch for changes in the array reference to catch data reset, when new project button is clicked.
        this.$watch(
            () => this.tableRowData,
            (newData, oldData) => {
                // Allow re-render if not currently updating from grid
                if (newData !== oldData && !this.isUpdatingFromGrid) {
                    console.log('Data reference changed, re-rendering grid');
                    this.observeAndRenderWhenVisible(newData);
                }
            }
        );

        // Watch for when the Data tab becomes visible
        this.$watch(
            () => this.selectedHeaderTabContent,
            (newTab, oldTab) => {
                if (newTab === 'dataContent' && oldTab !== 'dataContent') {
                    console.log('Data tab became visible, re-rendering grid');
                    console.log('Current tableRowData:', this.tableRowData);
                    console.log('Store tableRowData:', this.$store.state.dataStore.tableRowData);
                    // Always use the store data to ensure we have the latest
                    const currentData = this.$store.state.dataStore.tableRowData;
                    console.log('Using data from store:', currentData);
                    // Small delay to ensure the tab is fully visible
                    this.$nextTick(() => {
                        this.observeAndRenderWhenVisible(currentData);
                    });
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
        console.log('observeAndRenderWhenVisible called with:', data);
        console.log('Data passed to observe method length:', data?.length);

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
                    // Always use fresh data from store instead of captured data
                    const freshData = this.$store.state.dataStore.tableRowData;
                    console.log('ResizeObserver using fresh data from store:', freshData);
                    this.renderGrid(freshData);
                    break;
                }
            }
        });

        this.resizeObserver.observe(container);
    }

    renderGrid(data: Array<Record<string, any>>) {
        console.log('renderGrid called with data:', data);
        console.log('Data length:', data?.length);
        console.log('First row:', data?.[0]);

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

        console.log('Header detected:', isHeaderRow);
        console.log('Header data:', header);
        console.log('Body data length:', bodyData.length);

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
        // Don't call updateCSVFromGrid() here to avoid infinite loops
    }

    updateCSVFromGrid() {
        if (!this.gridInstance?.dataTable) return;

        if (this.isUpdatingFromGrid) {
            console.log('Already updating from grid, skipping');
            return;
        }

        console.log('Updating CSV from grid');

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

        // Set flag before any store updates
        this.isUpdatingFromGrid = true;

        if (nonEmptyCols.length === 0) {
            this.$store.commit('dataStore/setTableCSV', '');
            // Reset flag after update
            this.$nextTick(() => {
                this.isUpdatingFromGrid = false;
                console.log('Flag reset after CSV clear');
            });
            return;
        }

        // Update tableRowData to match the grid data
        const updatedRowData: Array<Record<string, any>> = [];

        // Header row
        const headerRow: Record<string, any> = {};
        columnIds.forEach((colId) => {
            headerRow[colId] = dataTable.getCell(colId, 0) || '';
        });

        updatedRowData.push(headerRow);

        // Data rows
        for (let i = 1; i < rowCount; i++) {
            const row: Record<string, any> = {};
            columnIds.forEach((colId) => {
                row[colId] = dataTable.getCell(colId, i) || '';
            });
            updatedRowData.push(row);
        }

        // Update the store with the new data - this will update both tableRowData and CSV
        this.$store.commit('dataStore/setTableRowData', updatedRowData);

        // Reset flag after update
        this.$nextTick(() => {
            this.isUpdatingFromGrid = false;
            console.log('Flag reset after data update');
        });
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

.se-grid-container .highcharts-datagrid-header-cell,
.se-grid-container .highcharts-datagrid-header-cell-content,
.se-grid-container td {
    text-align: center !important;
}

/* Make CSV header bold*/
.se-grid-container .highcharts-datagrid-row[data-row-index="0"] td {
    font-weight: bold;
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
