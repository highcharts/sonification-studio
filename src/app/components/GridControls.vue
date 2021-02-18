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
                aria-label="Number of rows to add"
            >
            <span
                aria-hidden="true"
                class="control-label grid-controls-center"
            >
                rows
            </span>
            <SEButton
                class="add-btn"
                aria-label="Add empty rows to grid"
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
                    v-model="fillEquationColumn"
                    labelledby="data-labelDrop"
                    :options="fillDropdownList"
                />
            </div>

            <div class="grid-control-item expand">
                <SEControl
                    v-slot="slotProps"
                    label="Fill equation"
                    helptext="Fill each row in a column with the results from an equation. Refer to values in other columns by the column name. Example: 2 * B + A. Note: 'i' refers to the row number. Example: 2 + 5 * i."
                    helptext-below
                >
                    <SETextbox
                        :id="slotProps.controlId"
                        v-model="fillEquation"
                        @keydown.enter="fillColumn()"
                    />
                </SEControl>
            </div>
            <SEButton
                aria-label="Fill column"
                @click="fillColumn()"
            >
                Fill
            </SEButton>
        </div>

        <div class="grid-controls-group">
            <SEButton @click="onClearDataClick">
                Clear data
            </SEButton>
            <SEFileUploadButton @load="onDataImport">
                Import data
            </SEFileUploadButton>
        </div>
    </div>
</template>

<script lang="ts">
import { downloadURI } from '../../core/utils/browserUtils';
import SEButton from './basic/SEButton.vue';
import SEFileUploadButton from './basic/SEFileUploadButton.vue';
import SEDropdown from './basic/SEDropdown.vue';
import SETextbox from './basic/SETextbox.vue';
import SEControl from './basic/SEControl.vue';

type ColumnDropdownItem = { name: string; value: string };

export default {
    components: {
        SEButton, SEFileUploadButton, SEDropdown, SEControl, SETextbox
    },
    data() {
        return {
            fillDropdownList: [
                { name: 'A', value: 'A' }
            ],
            rowsToAdd: 10,
            fillEquation: '',
            fillEquationColumn: ''
        };
    },
    beforeMount() {
        this.fillDropdownList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            .map((x): ColumnDropdownItem => ({ name: x, value: x }));
    },
    methods: {
        onClearDataClick() {
            this.$store.commit('dataStore/setTableRowData', []);
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
        },

        fillColumn() {
            const equation = this.fillEquation?.trim();
            const destinationColumn = this.fillEquationColumn;

            if (equation) {
                this.$store.commit('dataStore/fillColumn', {
                    columnName: destinationColumn,
                    equation
                });
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

    input[type="number"], /deep/ .se-control-content input {
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

    .control-label, /deep/ .se-control-label {
        font-size: 13px;
    }
</style>
