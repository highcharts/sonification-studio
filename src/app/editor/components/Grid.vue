<template>
    <div class="se-grid-container highcharts-light">
        <!-- highcharts-light: the app has no dark mode, so the grid keeps
             its light colors when the system uses a dark color scheme -->
        <div ref="gridContainer" />
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Raw } from 'vue';
import { mapState } from 'vuex';
import * as GridPro from '@highcharts/grid-pro/grid-pro';
import '@highcharts/grid-pro/css/grid-pro.css';
import '../core/gridProSetup';
import {
    applyCellEdit,
    compareDates,
    onGridCellEdit,
    prepareGridData,
    type CellEdit,
    type GridTableData,
    type TableRowData
} from '../core/utils/gridData';

type GridHeaderOptions = NonNullable<GridPro.Options['header']>;
type GridColumnOptions = NonNullable<GridPro.Options['columns']>;

// Grid Pro calls a grid's load callback only after a successful render. A
// render that fails (Grid Pro leaves the error unhandled) is given up on after
// this time, so the render queue goes on.
const gridRenderTimeout = 10000;

export default defineComponent({
    data() {
        return {
            // The Grid Pro instance is stored with markRaw(), so Vue never
            // wraps it in a reactive proxy.
            gridInstance: null as Raw<GridPro.Grid> | null,
            // Grid Pro renders asynchronously, and a grid destroyed while it
            // renders breaks, so renders are queued. This resolves when the
            // last queued render has finished or failed.
            gridRendered: Promise.resolve() as Promise<void>,
            renderCount: 0,
            // Column ids of the grid currently shown
            gridColumnIds: [] as string[],
            // Stops writing the current grid's edits to the store
            stopWatchingGridEdits: null as null | (() => void),
            resizeObserver: null as ResizeObserver | null,
            isUpdatingFromGrid: false,
            hasMountedGridOnce: false,
            pendingRebuild: false,
            unsubscribeFromStore: null as null | (() => void)
        };
    },

    computed: {
        ...mapState('dataStore', ['tableRowData']),
        ...mapState('viewStore', ['selectedHeaderTabContent']),
    },

    mounted() {
        // Rebuild the grid when the data changes outside it: CSV imports,
        // added rows, filled columns, a cleared grid, a new project or a
        // loaded project file. Until the grid has first been rendered, it is
        // rendered with the latest data when it first becomes visible.
        this.unsubscribeFromStore = this.$store.subscribe((mutation) => {
            if (
                mutation.type === 'dataStore/setTableRowData' ||
                mutation.type === 'dataStore/setTableCSV' ||
                mutation.type === 'dataStore/addTableRows' ||
                mutation.type === 'dataStore/fillColumn' ||
                mutation.type === 'dataStore/restoreStoreState'
            ) {
                if (this.isUpdatingFromGrid || !this.hasMountedGridOnce) return;
                const onDataTab = this.$store.state.viewStore.selectedHeaderTabContent === 'dataContent';

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
                this.observeAndRenderWhenVisible();
            });
        } else {
            this.observeAndRenderWhenVisible();
        }

        // Watch for when the Data tab becomes visible
        this.$watch(
            () => this.selectedHeaderTabContent,
            (newTab, oldTab) => {
                if (newTab === 'dataContent' && oldTab !== 'dataContent') {
                    this.$nextTick(() => {
                        if (this.pendingRebuild) {
                            this.rebuildGridFromStore();
                            this.pendingRebuild = false;
                        } else {
                            this.observeAndRenderWhenVisible();
                        }
                    });
                }
            }
        );

    },

    beforeUnmount() {
        // Drop queued renders, and destroy the grid once it has rendered
        this.renderCount++;
        void this.gridRendered.then(() => {
            this.destroyGrid();
        });
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.unsubscribeFromStore) {
            this.unsubscribeFromStore();
            this.unsubscribeFromStore = null;
        }
    },

    methods: {
        // Render the grid the first time its container is visible (it is
        // mounted while the Data tab is hidden).
        observeAndRenderWhenVisible() {
            const container = this.$refs.gridContainer as HTMLElement | undefined;
            if (!container) return;

            // If grid already built once, skip rebuilding.
            if (this.hasMountedGridOnce) {
                return;
            }

            if (typeof ResizeObserver === 'undefined') {
                this.renderGrid();
                return;
            }

            // If there was a previous observer, disconnect it before setting a new one.
            this.resizeObserver?.disconnect();

            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 50 && height > 50 && !this.hasMountedGridOnce) {
                        // On first visible, render once.
                        this.renderGrid();
                        break;
                    }
                }
            });

            this.resizeObserver.observe(container);
        },

        // helper to rebuild with latest stored data
        rebuildGridFromStore() {
            this.renderGrid();

            // Ensure layout after visibility changes
            void this.gridRendered.then(() => {
                requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
            });
        },

        // Render the grid with the data in the store
        renderGrid() {
            const container = this.$refs.gridContainer as HTMLElement | undefined;
            if (!container) return;

            // Rendering now, so the render on first visibility is not needed
            this.resizeObserver?.disconnect();
            this.hasMountedGridOnce = true;

            const tableData = prepareGridData(this.$store.state.dataStore.tableRowData);
            const options = this.getGridOptions(tableData);
            const renderId = ++this.renderCount;

            this.gridRendered = this.gridRendered.then(() => {
                // Skip a render that a later one replaces
                if (renderId !== this.renderCount) {
                    return;
                }
                this.destroyGrid();
                this.gridColumnIds = tableData.columnIds;

                return new Promise<void>((resolve) => {
                    const timeout = setTimeout(() => {
                        console.error('The data grid did not finish rendering.');
                        resolve();
                    }, gridRenderTimeout);

                    this.gridInstance = markRaw(
                        new GridPro.Grid(container, options, (grid) => {
                            clearTimeout(timeout);
                            // Unless a later render has replaced it
                            if (grid === this.gridInstance) {
                                this.watchGridEdits(grid, tableData.firstDataRowIndex);
                            }
                            resolve();
                        })
                    );
                });
            }).catch((error: unknown) => {
                // Keep the queue going for later renders and the destroy on
                // unmount
                console.error('The data grid could not be rendered:', error);
            });
        },

        destroyGrid() {
            this.stopWatchingGridEdits?.();
            this.stopWatchingGridEdits = null;
            try {
                this.gridInstance?.destroy();
            } catch (error) {
                // A grid that failed to render may fail to be destroyed
                console.error('The data grid could not be destroyed:', error);
            }
            this.gridInstance = null;
        },

        // Write the grid's cell edits to the store
        watchGridEdits(grid: GridPro.Grid, firstDataRowIndex: number) {
            const dataProvider = grid.dataProvider;
            const dataTable = dataProvider && 'getDataTable' in dataProvider ?
                dataProvider.getDataTable() :
                void 0;
            if (dataTable) {
                this.stopWatchingGridEdits = onGridCellEdit(
                    dataTable,
                    firstDataRowIndex,
                    this.onGridCellEdited
                );
            }
        },

        getGridOptions(tableData: GridTableData): GridPro.Options {
            const { columnIds, dataTypes, headerColumnCount, headerRow } = tableData;
            const getCSVHeader = (id: string): string | undefined => {
                const value = headerRow[id];
                return typeof value === 'string' && value.trim() !== '' ? value : void 0;
            };

            // A, B, C, ... as primary headers, and the CSV headers as
            // secondary headers below them
            const header: GridHeaderOptions = columnIds.map((id) => {
                const csvHeader = getCSVHeader(id);

                if (csvHeader) {
                    return {
                        format: id,
                        className: 'hcg-center',
                        columns: [{
                            // The text is set by the column's header
                            // formatter
                            columnId: id,
                            className: 'hcg-center',
                            // Grid Pro labels the cell with the column id
                            // only, so screen readers get the CSV header as
                            // its description.
                            accessibility: { description: csvHeader }
                        }]
                    };
                }
                return {
                    columnId: id,
                    format: id,
                    className: 'hcg-center'
                };
            });

            const columns: GridColumnOptions = columnIds.map((id, index) => {
                const csvHeader = getCSVHeader(id);
                const column: GridColumnOptions[number] = {
                    id,
                    dataType: dataTypes[id],
                    cells: {
                        className: index < headerColumnCount ?
                            'hcg-center hcg-header-column' :
                            'hcg-center'
                    }
                };

                // The CSV header as written: as a header format, "{...}"
                // would be taken as a template expression.
                if (csvHeader) {
                    column.header = { formatter: () => csvHeader };
                }

                // Dates are shown as written in the CSV, and sorted by date
                if (dataTypes[id] === 'datetime') {
                    column.dataType = 'string';
                    column.sorting = { compare: compareDates };
                }
                return column;
            });

            return {
                data: {
                    columns: tableData.columns
                },
                header,
                columnDefaults: {
                    width: 200,
                    cells: {
                        editMode: {
                            enabled: true
                        },
                        className: 'hcg-center',
                        // Show values as they are, as Grid Pro 2 did (Grid
                        // Pro 3 adds thousands separators to numbers)
                        format: '{value}'
                    },
                    header: {
                        className: 'hcg-center'
                    },
                    sorting: {
                        enabled: true
                    },
                    filtering: {
                        enabled: true
                    }
                },
                rendering: {
                    theme: 'hcg-theme-default',
                    rows: {
                        virtualization: true,
                        bufferSize: 20, // Increased buffer for smoother scrolling
                        strictHeights: true // Enable for better virtualization performance
                    },
                    columns: {
                        // Keep all columns (at most 50) in the DOM, as Grid
                        // Pro 2 did. Grid Pro 3 virtualizes from 20 columns.
                        virtualization: false,
                        resizing: {
                            // Resizing a column changes only its width, so
                            // the table scrolls horizontally instead of
                            // squeezing the other columns.
                            mode: 'independent'
                        }
                    }
                },
                columns
            };
        },

        // Write an edited cell back to the store, which updates the chart.
        // Only that cell changes: the other values are kept as they are in
        // the store, including the CSV header row the grid shows as headers.
        onGridCellEdited(edit: CellEdit) {
            const rows = applyCellEdit(
                this.$store.state.dataStore.tableRowData as TableRowData[],
                edit,
                this.gridColumnIds
            );

            // Ignore the store notifications of this commit
            this.isUpdatingFromGrid = true;
            this.$store.commit('dataStore/setTableRowData', rows);
            this.$nextTick(() => {
                this.isUpdatingFromGrid = false;
            });
        },

        // Scroll the grid to the last row with data, so that rows added below
        // it are in view.
        scrollToLastGridRowWithData() {
            void this.gridRendered.then(() => {
                const grid = this.gridInstance;
                const dataProvider = grid?.dataProvider;
                if (!grid?.viewport || !dataProvider || !('getDataTable' in dataProvider)) {
                    return;
                }
                // The rows as shown, after sorting and filtering
                const dataTable = dataProvider.getDataTable(true);
                if (!dataTable) {
                    return;
                }

                const rowCount = dataTable.getRowCount();
                let lastRowWithDataIndex = rowCount - 1;
                for (let i = rowCount - 1; i >= 0; --i) {
                    const row = dataTable.getRowObject(i);
                    if (row && Object.values(row).some((val) => val !== '' && val != null)) {
                        lastRowWithDataIndex = i;
                        break;
                    }
                }

                grid.viewport.scrollToRow(Math.max(0, lastRowWithDataIndex));
            });
        },
    },
});
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

.se-grid-container .hcg-header-cell,
.se-grid-container .hcg-header-cell-content,
.se-grid-container td {
    text-align: center !important;
}

td {
    font-size: 0.8rem !important;
}

/* Excel-style borders and bold headers. The Grid theme sets its defaults
   on its own element (as `.highcharts-light .hcg-theme-default`), so they
   are overridden there, with a more specific selector. */
.se-grid-container.highcharts-light .hcg-theme-default {
    --hcg-border-width: 1px;
    --hcg-border-color: #ccc;
    --hcg-row-border-width: 1px;
    --hcg-column-border-width: 1px;
    --hcg-header-background: #f8f9fa;
    --hcg-header-font-weight: bold;
}

/* Grid Pro measures the row height on a mock row, which has no bottom border
   as the last row in the table, so it is 1px lower than the other rows. The
   grid then corrects the row height but leaves the last row where the first
   height put it, and a long table cannot be scrolled to its end in one go. */
.se-grid-container .hcg-table tbody tr.hcg-mocked-row > td {
    border-bottom: var(--hcg-row-border-width) solid var(--hcg-border-color);
}

/* Focus ring drawn inside to avoid layout shift/clipping */
.se-grid-container td:focus,
.se-grid-container .hcg-header-cell:focus {
  outline: none;
  border-color: transparent !important;
  box-shadow: inset 0 0 0 2px red !important;
}

/* Bold styling for header columns (detected dynamically) */
.se-grid-container .hcg-header-column {
  font-weight: bold !important;
}
</style>
