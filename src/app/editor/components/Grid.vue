<template>
    <div class="se-grid-container">
        <div ref="gridContainer" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState } from 'vuex';
import * as GridPro from '@highcharts/grid-pro/grid-pro';
import '@highcharts/grid-pro/css/grid-pro.css';

@Component({
    computed: {
        ...mapState('dataStore', ['tableRowData']),
        ...mapState('viewStore', ['selectedHeaderTabContent']),
    },
})
export default class Grid extends Vue {
    gridInstance: any = null;
    resizeObserver: ResizeObserver | null = null;
    isUpdatingFromGrid = false;
    isUpdatingFromStore = false;
    hasMountedGridOnce = false;
    pendingRebuild = false;
    unsubscribeFromStore: null | (() => void) = null;

    tableRowData!: Array<Record<string, any>>;
    selectedHeaderTabContent!: string;
    $refs!: { gridContainer: HTMLElement };
    pendingScrollToBottom = false;

    mounted() {
        // Get CSV imports to propagate immediately
        this.unsubscribeFromStore = this.$store.subscribe((mutation, state) => {
            if (
                mutation.type === 'dataStore/setTableRowData' ||
                mutation.type === 'dataStore/setTableCSV' ||
                mutation.type === 'dataStore/addTableRows' ||
                mutation.type === 'dataStore/fillColumn'
            ) {
                if (this.isUpdatingFromGrid) return; // ignore grid-originated commits
                const onDataTab = this.$store.state.viewStore.selectedHeaderTabContent === 'dataContent';

                // If rows were added, do scroll to bottom after the rebuild
                if (mutation.type === 'dataStore/addTableRows') {
                    this.pendingScrollToBottom = true;
                }

                if (onDataTab) {
                    this.rebuildGridFromStore();
                } else {
                    this.pendingRebuild = true;
                }
            }
        });

        // Check if there's data in the store, don't reset to placeholder if there's real data
        const storeData = this.$store.state.dataStore.tableRowData;
        if (!this.tableRowData?.length && !storeData?.length) {
            this.$store.commit('dataStore/setToPlaceholderData');
            this.$nextTick(() => {
                this.observeAndRenderWhenVisible(this.$store.state.dataStore.tableRowData);
            });
        } else {
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
                    this.observeAndRenderWhenVisible(newData);
                }
            }
        );

        // Watch for when the Data tab becomes visible
        this.$watch(
            () => this.selectedHeaderTabContent,
            (newTab, oldTab) => {
                if (newTab === 'dataContent' && oldTab !== 'dataContent') {
                    const currentData = this.$store.state.dataStore.tableRowData;
                    this.$nextTick(() => {
                        if (this.pendingRebuild) {
                            this.rebuildGridFromStore();
                            this.pendingRebuild = false;
                        } else {
                            this.observeAndRenderWhenVisible(currentData);
                        }
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
        if (this.unsubscribeFromStore) {
            this.unsubscribeFromStore();
            this.unsubscribeFromStore = null;
        }
    }

    observeAndRenderWhenVisible(data: Array<Record<string, any>>) {
        const container = this.$refs.gridContainer as HTMLElement;
        if (!container) return;

        // If grid already buildt once, skip rebuilding.
        if (this.gridInstance && this.hasMountedGridOnce) {
            return;
        }

        if (typeof ResizeObserver === 'undefined') {
            this.renderGrid(data);
            this.hasMountedGridOnce = true;
            return;
        }

        // Do NOT destroy here, we are preparing the first mount only.
        // If there was a previous observer, disconnect it before setting a new one.
        this.resizeObserver?.disconnect();

        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 50 && height > 50) {
                    this.resizeObserver?.disconnect();
                    // On first visible, render once and mark as mounted.
                    this.renderGrid(data);
                    this.hasMountedGridOnce = true;
                    break;
                }
            }
        });

        this.resizeObserver.observe(container);
    }

    // Detect how many consecutive columns from the left contain header-like data (mostly strings/text)
    private detectHeaderColumnCount(data: Array<Record<string, any>>, columnKeys: string[]): number {
        if (!data.length || !columnKeys.length) return 0;

        const sampleSize = Math.min(10, data.length); // Check first 10 rows or all if less
        let headerColumnCount = 0;

        // Check each column from left to right
        for (let colIndex = 0; colIndex < columnKeys.length; colIndex++) {
            const key = columnKeys[colIndex];
            let stringCount = 0;
            let totalCells = 0;

            // Sample cells in this column
            for (let rowIndex = 0; rowIndex < sampleSize; rowIndex++) {
                const value = data[rowIndex][key];
                totalCells++;

                // Check if it's a non-numeric string (likely header text)
                if (typeof value === 'string' && value.trim() !== '' && isNaN(Number(value))) {
                    stringCount++;
                }
            }

            // If more than 70% of cells in this column are non-numeric strings, it's a header column
            const isHeaderColumn = (stringCount / totalCells) > 0.7;

            if (isHeaderColumn) {
                headerColumnCount = colIndex + 1;
            } else {
                // Stop at first non-header column (we only want consecutive header columns from the left)
                break;
            }
        }

        return headerColumnCount;
    }

    // Detect the data type of a column for proper Grid Pro handling and sorting/filtering
    // Otherwise, seems to detect the columns as strings only and sorting goes wrong.
    private detectColumnDataType(columnData: any[]): string {
        if (!columnData.length) return 'string';

        // Check if values in the column are numeric
        let numericCount = 0;
        let dateCount = 0;
        let booleanCount = 0;
        let totalNonEmpty = 0;

        columnData.forEach(value => {
            if (value !== '' && value != null) {
                totalNonEmpty++;

                // Check if it's a number
                const numValue = Number(value);
                if (!isNaN(numValue) && isFinite(numValue)) {
                    numericCount++;
                }

                // Check if it's a boolean
                if (typeof value === 'boolean' || value === 'true' || value === 'false') {
                    booleanCount++;
                }

                // Check if it's a date (basic check)
                if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                    dateCount++;
                }
            }
        });

        if (totalNonEmpty === 0) return 'string';

        // Determine data type based on majority (>80% threshold)
        const threshold = 0.8;
        if ((numericCount / totalNonEmpty) > threshold) {
            return 'number';
        } else if ((booleanCount / totalNonEmpty) > threshold) {
            return 'boolean';
        } else if ((dateCount / totalNonEmpty) > threshold) {
            return 'datetime';
        }

        return 'string'; // Default to string
    }

    // Convert column data to the appropriate type for Grid Pro
    private convertColumnData(columnData: any[], dataType: string): any[] {
        if (dataType === 'number') {
            return columnData.map(value => {
                if (value === '' || value == null) return value;
                const numValue = Number(value);
                return !isNaN(numValue) && isFinite(numValue) ? numValue : value;
            });
        } else if (dataType === 'boolean') {
            return columnData.map(value => {
                if (value === '' || value == null) return value;
                if (typeof value === 'boolean') return value;
                if (value === 'true') return true;
                if (value === 'false') return false;
                return value;
            });
        } else if (dataType === 'datetime') {
            return columnData.map(value => {
                if (value === '' || value == null) return value;
                const dateValue = new Date(value);
                return !isNaN(dateValue.getTime()) ? dateValue : value;
            });
        }

        // For string type, return as-is
        return columnData;
    }

    // helper to rebuild with latest stored data
    private rebuildGridFromStore() {
        const container = this.$refs.gridContainer as HTMLElement;
        if (!container) return;
        const latest = this.$store.state.dataStore.tableRowData;

        if (this.gridInstance?.destroy) {
            this.gridInstance.destroy();
            this.gridInstance = null;
        }
        this.renderGrid(latest);

        // Ensure layout after visibility changes
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
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

        // Performance optimization: Only process columns that have data
        const actualDataColumns = Object.keys(data[0] || {});
        const maxColumns = Math.min(columnCount, actualDataColumns.length + 5); // Add some buffer
        const optimizedColumnKeys = columnKeys.slice(0, maxColumns);

        // Detect how many consecutive columns from the left are headers
        const headerColumnCount = this.detectHeaderColumnCount(bodyData, optimizedColumnKeys);

        // Performance optimization: Only pad with necessary columns
        const paddedData = bodyData.map((row) => {
            const newRow: Record<string, any> = {};
            optimizedColumnKeys.forEach((key) => {
                newRow[key] = row[key] ?? '';
            });
            return newRow;
        });

        // Create columns data structure and detect data types for Grid Pro
        const columns: Record<string, any[]> = {};
        const columnDataTypes: Record<string, string> = {};

        // Performance optimization: Process columns in batches and use simpler detection for empty columns
        optimizedColumnKeys.forEach((key) => {
            const columnData = paddedData.map((row) => row[key]);

            // Quick check: if column is mostly empty, skip expensive detection
            const nonEmptyCount = columnData.filter(val => val !== '' && val != null).length;
            if (nonEmptyCount === 0) {
                columnDataTypes[key] = 'string';
                columns[key] = columnData;
                return;
            }

            // Only do expensive detection for columns with data
            const dataType = nonEmptyCount > 5 ? this.detectColumnDataType(columnData) : 'string';
            columnDataTypes[key] = dataType;

            // Convert the data based on detected type
            const convertedData = this.convertColumnData(columnData, dataType);
            columns[key] = convertedData;
        });

        // Create header configuration with A, B, C as primary and CSV headers as secondary
        const headerConfig = optimizedColumnKeys.map((key) => {
            const csvHeaderValue = header[key] || '';

            // If there's a CSV header value, create a grouped header structure
            if (csvHeaderValue && csvHeaderValue.trim() !== '') {
                return {
                    format: key, // Primary header (A, B, C, etc.)
                    className: 'hcg-center', // Apply center alignment to primary header
                    columns: [{
                        columnId: key,
                        format: csvHeaderValue, // Secondary header (CSV header value)
                        className: 'hcg-center' // Apply center alignment to secondary header too
                    }]
                };
            } else {
                // If no CSV header, just use the column key
                return {
                    columnId: key,
                    format: key,
                    className: 'hcg-center' // Apply center alignment to single header
                };
            }
        });

        const config = {
            dataTable: {
                columns
            },
            header: headerConfig,
            columnDefaults: {
                width: 200,
                cells: {
                    editMode: {
                        enabled: true
                    },
                    className: 'hcg-center',
                    events: {
                        afterEdit: () => {
                            this.updateCSVFromGrid();
                        }
                    }
                },
                header: {
                    className: 'hcg-center'
                },
                sorting: {
                    sortable: true
                },
                filtering: {
                    enabled: true,
                }
            },
            rendering: {
                theme: 'hcg-theme-default',
                containerHeight: '100%',
                containerWidth: '100%',
                rows: {
                    virtualization: true,
                    bufferSize: 20, // Increased buffer for smoother scrolling
                    strictHeights: true // Enable for better virtualization performance
                },
                columns: {
                    distribution: 'fixed',
                    resizing: {
                        mode: 'fixed'
                    }
                }
            },
            columns: optimizedColumnKeys.map((key, index) => {
                const isHeaderColumn = index < headerColumnCount;
                return {
                    id: key,
                    dataType: columnDataTypes[key], // Set the detected data type
                    cells: {
                        editMode: {
                            enabled: true
                        },
                        className: isHeaderColumn ? 'hcg-center hcg-header-column' : 'hcg-center'
                    }
                };
            }),
        } as any;

        if (this.gridInstance) {
            this.gridInstance.destroy();
        }

        this.gridInstance = GridPro.grid(container, config);
        // Don't call updateCSVFromGrid() here to avoid infinite loops

        if (this.pendingScrollToBottom) {
            this.$nextTick(() => {
                // Tiny delay lets virtualization/render finish
                requestAnimationFrame(() => {
                    this.scrollToLastGridRowWithData();
                    this.pendingScrollToBottom = false;
                });
            });
        }
    }

    updateCSVFromGrid() {
        if (!this.gridInstance?.dataTable) return;

        if (this.isUpdatingFromGrid) {
            return;
        }
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
        });
    }

    scrollToLastGridRowWithData() {
        if (!this.gridInstance || !this.gridInstance.dataTable) return;

        // Wait for DOM/virtualization to finish
        this.$nextTick(() => {
            requestAnimationFrame(() => {
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

                const container = this.$refs.gridContainer as HTMLElement;
                // Prefer the real tbody; fallback to the parent of the first row if needed
                const tbody =
                (container.querySelector('.highcharts-datagrid-table tbody') as HTMLElement) ||
                (container.querySelector('.highcharts-datagrid-row')?.parentElement as HTMLElement);

                if (!tbody) return;

                if (lastRowWithDataIndex !== -1) {
                    const targetRow = tbody.children[lastRowWithDataIndex] as HTMLElement | undefined;
                    if (targetRow) {
                        tbody.scrollTo({ top: targetRow.offsetTop, behavior: 'smooth' });
                        return;
                    }
                }
                tbody.scrollTo({ top: tbody.scrollHeight, behavior: 'smooth' });
            });
        });
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
}

.se-grid-container > div {
    flex: 1 1 auto;
    min-height: 300px;
}

.se-grid-container .highcharts-datagrid-header-cell,
.se-grid-container .highcharts-datagrid-header-cell-content,
.se-grid-container td {
    text-align: center !important;
}

td {
    font-size: 0.8rem !important;
}

/* Make CSV header bold*/
.se-grid-container .highcharts-datagrid-row[data-row-index="0"] td {
    font-weight: bold;
}

.se-grid-container .highcharts-datagrid-container {
    width: 100%;
    height: 100%;
}

/* Excel-style borders */
.se-grid-container {
    --hcg-border-width: 1px;
    --hcg-border-color: #ccc;
    --hcg-row-border-width: 1px;
    --hcg-column-border-width: 1px;
    --hcg-header-background: #f8f9fa;
    --hcg-padding: 8px;
}

.se-grid-container .highcharts-datagrid-table th,
.se-grid-container .highcharts-datagrid-table td {
    border-left: 0.5px solid #ccc;
    border-right: 0.5px solid #ccc;
    box-sizing: border-box;
}

.se-grid-container .highcharts-datagrid-table th,
.se-grid-container .highcharts-datagrid-table td {
    padding: 6px 10px;
}

.se-grid-container .highcharts-datagrid-header-cell {
    background-color: #f8f9fa;
    font-weight: bold;
}

/* Focus ring drawn inside to avoid layout shift/clipping */
.se-grid-container .highcharts-datagrid-cell:focus,
.se-grid-container td:focus,
.se-grid-container .highcharts-datagrid-header-cell:focus {
  outline: none;
  border-color: transparent !important;
  box-shadow: inset 0 0 0 2px red !important;
}

/* Bold styling for header columns (detected dynamically) */
.se-grid-container .hcg-header-column {
  font-weight: bold !important;
}
</style>
