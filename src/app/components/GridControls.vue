<template>
    <div class="grid-controls">
        <div class="grid-controls-group">
            <span
                aria-hidden="true"
                class="control-label grid-controls-center"
            >
                Add
            </span>
            <input
                v-model.number="rowsToAdd"
                type="number"
                min="0"
                aria-label="Add rows"
            >
            <span
                aria-hidden="true"
                class="control-label grid-controls-center"
            >
                rows
            </span>
            <SEButton
                class="add-btn"
                @click="onAddRowsClick"
            >
                Add
            </SEButton>
        </div>

        <div class="grid-controls-group expand">
            <div class="grid-control-item">
                <p
                    id="data-labelDrop"
                    class="control-label"
                >
                    Fill column
                </p>
                <SEDropdown
                    id="data-fillcolumn-drop"
                    labelledby="data-labelDrop"
                    :options="fillDropdownList"
                />
            </div>

            <div class="grid-control-item expand">
                <p
                    id="data-labelEquation"
                    class="control-label"
                >
                    Using equation
                </p>
                <input
                    type="text"
                    aria-labelledby="data-labelEquation"
                >
            </div>
            <SEButton>Go</SEButton>
        </div>

        <div class="grid-controls-group">
            <SEButton @click="onClearDataClick">
                Clear data
            </SEButton>
            <SEFileUploadButton @load="onDataImport">
                Import data
            </SEFileUploadButton>
            <SEButton @click="onExportDataClick">
                Export data
            </SEButton>
        </div>
    </div>
</template>

<script lang="ts">
import SEButton from './basic/SEButton.vue';
import SEFileUploadButton from './basic/SEFileUploadButton.vue';
import SEDropdown from './basic/SEDropdown.vue';

export default {
    components: {
        SEButton, SEFileUploadButton, SEDropdown
    },
    data: function () {
        return {
            fillDropdownList: [
                { name: 'A', value: 'A' },
                { name: 'B', value: 'B' },
                { name: 'C', value: 'C' },
                { name: 'D', value: 'D' }
            ],
            rowsToAdd: 1
        };
    },
    methods: {
        onClearDataClick() {
            this.$store.commit('dataStore/setTableRowData', []);
        },

        onExportDataClick() {
            const csv = this.$store.state.dataStore.tableCSV;
            if (csv) {
                const dataURI = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
                const link = document.createElement('a');
                link.setAttribute('href', dataURI);
                link.setAttribute('download', 'export.csv');
                link.click();
            }
        },

        onAddRowsClick() {
            const numRows = this.rowsToAdd;
            if (numRows) {
                this.$store.commit('dataStore/addTableRows', numRows);

                // Scroll after row adding has been processed.
                setTimeout(() => this.$emit('triggerScrollLastGridRowWithData'), 0);
            }
        },

        onDataImport(fileContents: string) {
            if (fileContents) {
                this.$store.dispatch('dataStore/loadFromCSV', fileContents);
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .grid-controls {
        margin: 0px 10px 10px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        .se-dropdown {
            width: 80px;
        }
    }

    .grid-controls-group {
        display: flex;
        align-items: flex-end;
    }

    .grid-control-item {
        margin: 5px;
        p {
            margin-bottom: 5px;
        }
    }

    .grid-controls-center {
        align-self: center;
    }

    input[type="number"], input[type="text"] {
        display: block;
        font-family: inherit;
        font-size: 13px;
        font-weight: normal;
        line-height: 1;
        padding: .30em 0.7em .31em .7em;
        height: 30px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0;
        border: 1px solid @seinput-border-color;
        border-radius: 4px;
    }

    input[type="number"] {
        align-self: center;
        width: 55px;
        margin: 0 8px;
    }

    .add-btn {
        margin-left: 12px;
    }

    .expand {
        flex: 1;
        justify-content: center;
    }

    .grid-controls-group.expand {
        margin: 0 40px;
    }

    .control-label {
        font-size: 13px;
    }
</style>
