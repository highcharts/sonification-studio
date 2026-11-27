<template>
    <div class="se-grid-container highcharts-light">
        <!-- highcharts-light: the app has no dark mode, so the grid keeps
             its light colors when the system uses a dark color scheme -->
        <div ref="gridContainer" />
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Raw } from 'vue';
import { mapState, mapStores } from 'pinia';
import * as GridPro from '@highcharts/grid-pro/grid-pro';
import '@highcharts/grid-pro/css/grid-pro.css';
import '../core/gridProSetup';
import {
    applyCellEdit,
    getGridColumnCount,
    getGridDataTable,
    getGridOptions,
    getGridRebuild,
    onGridCellEdit,
    prepareGridData,
    type CellEdit,
    type GridTableData
} from '../core/utils/gridData';
import { useDataStore } from '../store/modules/data';
import { useViewStore } from '../store/modules/view';

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
            // Number of columns the grid shows
            gridColumnCount: 0,
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
        ...mapState(useDataStore, ['tableRowData']),
        ...mapState(useViewStore, ['selectedHeaderTabContent']),
        ...mapStores(useDataStore, useViewStore),
    },

    mounted() {
        // Rebuild the grid when the data changes outside it
        this.unsubscribeFromStore = this.dataStore.$onAction(({ name, after }) => after(() => {
            const rebuild = getGridRebuild(name, {
                isUpdatingFromGrid: this.isUpdatingFromGrid,
                hasRendered: this.hasMountedGridOnce,
                onDataTab: this.viewStore.selectedHeaderTabContent === 'dataContent'
            });
            if (rebuild === 'now') {
                this.rebuildGridFromStore();
            } else if (rebuild === 'later') {
                this.pendingRebuild = true;
            }
        }));

        // Check if there's data in the store, don't reset to placeholder if there's real data
        const storeData = this.dataStore.tableRowData;
        if (!this.tableRowData?.length && !storeData?.length) {
            this.dataStore.setToPlaceholderData();
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

            const tableData = prepareGridData(this.dataStore.tableRowData);
            const options = this.getGridOptions(tableData);
            const renderId = ++this.renderCount;

            this.gridRendered = this.gridRendered.then(() => {
                // Skip a render that a later one replaces
                if (renderId !== this.renderCount) {
                    return;
                }
                this.destroyGrid();

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
                                this.gridColumnCount = tableData.columnIds.length;
                                this.afterGridRender(grid, tableData.firstDataRowIndex);
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

        // The grid's options for the data in tableData
        getGridOptions(tableData: GridTableData): GridPro.Options {
            return getGridOptions(
                tableData,
                // The optional Grid Key, set at build time (see the README)
                import.meta.env.VITE_GRID_KEY,
                this.addGridColumns
            );
        },

        // Write the grid's edits to the store, and number its rows
        afterGridRender(grid: GridPro.Grid, firstDataRowIndex: number) {
            this.watchGridEdits(grid, firstDataRowIndex);
            // Grid Pro 3.2 workaround, see gridProSetup.ts
            grid.viewport?.syncAriaRowIndexes().catch((error: unknown) => {
                console.error('The data grid rows could not be numbered:', error);
            });
        },

        // Add columns to the grid after an edit, so that there are empty
        // columns after the last one with a value to add data in (see
        // getGridColumnCount). The grid's data is updated from the store,
        // which has the edit. The grid keeps its sorting and filtering, the
        // focused cell and the scroll position. It keeps its columns when
        // values are deleted, until it is rebuilt.
        addGridColumns() {
            const grid = this.gridInstance;
            if (!grid || getGridColumnCount(this.dataStore.tableRowData) <= this.gridColumnCount) {
                return;
            }
            this.gridRendered = this.gridRendered.then(async () => {
                // Unless a rebuild has replaced the grid, with the latest data
                const tableData = prepareGridData(this.dataStore.tableRowData);
                if (grid !== this.gridInstance || tableData.columnIds.length <= this.gridColumnCount) {
                    return;
                }
                // The update replaces the grid's data table
                this.stopWatchingGridEdits?.();
                this.stopWatchingGridEdits = null;
                // Grid Pro 3.2 restores the focus after the update, but not
                // the vertical scroll position: it reads it from the table
                // it has removed. So it is restored from before the update.
                const viewportState = grid.viewport?.getStateMeta();
                await grid.update(this.getGridOptions(tableData));
                if (viewportState) {
                    grid.viewport?.applyStateMeta(viewportState);
                }
                this.gridColumnCount = tableData.columnIds.length;
                this.afterGridRender(grid, tableData.firstDataRowIndex);
            }).catch((error: unknown) => {
                // Render the grid again, so that its edits are written to the
                // store again
                console.error('Columns could not be added to the data grid:', error);
                this.renderGrid();
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
            const dataTable = getGridDataTable(grid);
            if (dataTable) {
                this.stopWatchingGridEdits = onGridCellEdit(
                    dataTable,
                    firstDataRowIndex,
                    this.onGridCellEdited
                );
            }
        },

        // Write an edited cell back to the store, which updates the chart.
        // Only that cell changes: the other values are kept as they are in
        // the store, including the CSV header row the grid shows as headers.
        onGridCellEdited(edit: CellEdit) {
            const rows = applyCellEdit(this.dataStore.tableRowData, edit);

            // Ignore the store notifications of this update
            this.isUpdatingFromGrid = true;
            this.dataStore.setTableRowData(rows);
            this.$nextTick(() => {
                this.isUpdatingFromGrid = false;
            });
        },

        // Scroll the grid to the last row with data, so that rows added below
        // it are in view.
        scrollToLastGridRowWithData() {
            void this.gridRendered.then(() => {
                const grid = this.gridInstance;
                // The rows as shown, after sorting and filtering
                const dataTable = grid && getGridDataTable(grid, true);
                if (!grid?.viewport || !dataTable) {
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
