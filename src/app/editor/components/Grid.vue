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
            () => this.tableRowData,
            (newVal) => {
                if (Array.isArray(newVal) && newVal.length > 0) {
                    this.observeAndRenderWhenVisible(newVal);
                }
            },
            { deep: true, immediate: true }
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

        // Generate column keys A to AX (50 columns)
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

        // Ensure all rows have all 50 columns (with empty string if missing)
        const paddedData = bodyData.map((row) => {
            const newRow: Record<string, any> = {};
            columnKeys.forEach((key) => {
                newRow[key] = row[key] ?? '';
            });
            return newRow;
        });

        // Create columns data structure
        const columns: Record<string, any[]> = {};
        columnKeys.forEach((key) => {
            columns[key] = paddedData.map((row) => row[key]);

            // Add header title if present
            if (header[key]) {
                columns[key].unshift(header[key]);
            } else {
                columns[key].unshift('');
            }
        });

        const config = {
            dataTable: { columns },
            columnDefaults: {
                cells: {
                    editable: true,
                    className: 'hcg-center',
                },
            },
            columns: columnKeys.map((key) => ({
                id: key,
                title: key,
                editable: true,
            })),
            rendering: {
                theme: 'hcg-theme-default',
                containerHeight: '100%',
                containerWidth: '100%',
            },
        };

        if (this.gridInstance) {
            this.gridInstance.destroy();
        }

        this.gridInstance = createGrid(container, config);

        this.updateCSV(header, paddedData, columnKeys);
    }

    updateCSV(header: Record<string, any>, body: Array<Record<string, any>>, keys: string[]) {
        const headerLine = keys.map((k) => header[k]).join(';');

        const lines = body
            .filter((row) => Object.values(row).some((v) => v !== '' && v != null))
            .map((row) => keys.map((k) => ('' + (row[k] ?? '')).replace(/;/g, ' ')).join(';'));

        const csv = [headerLine, ...lines].join('\n');
        this.$store.commit('dataStore/setTableCSV', csv);
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
