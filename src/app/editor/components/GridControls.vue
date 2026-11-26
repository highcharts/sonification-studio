<template>
    <div class="grid-controls">
        <h3 class="sr-only">
            Grid tools
        </h3>
        <div class="grid-controls-group">
            <fieldset>
                <legend>
                    Add empty rows to grid
                </legend>

                <input
                    v-model.number="rowsToAdd"
                    type="number"
                    min="0"
                    aria-label="Number of rows to add"
                >
                <SEButton
                    class="add-btn"
                    aria-label="Add rows"
                    @click="onAddRowsClick"
                >
                    Add
                </SEButton>
            </fieldset>
        </div>

        <div class="grid-controls-group expand">
            <fieldset>
                <div class="grid-control-item expand">
                    <SEControl
                        v-slot="slotProps"
                        label="Fill column from equation"
                        :helptext="fillHelptext"
                        helptext-below
                        helpicon-inside
                    >
                        <SEInputbox
                            :id="slotProps.controlId"
                            v-model="fillEquation"
                            class="equation-input"
                            @keydown.enter="fillColumn()"
                        />
                    </SEControl>
                </div>

                <div class="grid-control-item">
                    <label
                        class="control-label"
                        for="data-fillcolumn-drop"
                    >
                        Column to fill
                    </label>
                    <SEDropdown
                        id="data-fillcolumn-drop"
                        v-model="fillEquationColumn"
                        :options="fillDropdownList"
                    />
                </div>

                <SEButton
                    aria-label="Fill column"
                    @click="fillColumn()"
                >
                    Fill
                </SEButton>
            </fieldset>
        </div>

        <div class="grid-controls-group">
            <SEButton @click="onClearDataClick">
                Clear Grid
            </SEButton>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import SEButton from './basic/SEButton.vue';
import SEDropdown from './basic/SEDropdown.vue';
import SEInputbox from './basic/SEInputbox.vue';
import SEControl from './basic/SEControl.vue';
import { type TableRow, useDataStore } from '../store/modules/data';

type ColumnDropdownItem = { name: string; value: string };

export default defineComponent({
    components: {
        SEButton, SEDropdown, SEControl, SEInputbox
    },
    emits: ['triggerScrollLastGridRowWithData'],
    data() {
        return {
            fillDropdownList: [
                { name: 'A', value: 'A' }
            ] as ColumnDropdownItem[],
            rowsToAdd: 10,
            fillEquation: '',
            fillEquationColumn: '',
            // Plain text: SEControl renders it as text, with a paragraph for each <br>
            fillHelptext: 'Fill each row in a column with the results from an equation.<br>Refer to values in other columns by the column name. Example: Filling column C with the equation "2 * B" will result in each row in column C having twice the value as in column B.<br>Use "i" to refer to the row number. Example: "2 * i" will fill in the values 2, 4, 6, 8 etc.<br>Advanced expressions are supported, similar to functionality found on typical graphing calculators. See "Expression syntax" in the mathjs.org documentation for details.'
        };
    },
    computed: {
        ...mapStores(useDataStore)
    },
    beforeMount() {
        this.fillDropdownList = 'ABCDEFGHIJK'.split('')
            .map((x): ColumnDropdownItem => ({ name: x, value: x }));
    },
    methods: {
        onClearDataClick() {
            if (window.confirm('This will clear all data from the grid. Proceed?')) {
                const emptyRowData: TableRow[] = Array.from(Array(10), () => ({}));
                this.dataStore.setTableRowData(emptyRowData);
                // A timeout seems to be required in order for the announcement not to be overshadowed.
                setTimeout(() => this.$announcer.announce('Data table cleared.'), 500);
            }
        },

        onAddRowsClick() {
            const numRows = this.rowsToAdd;
            if (numRows) {
                this.dataStore.addTableRows(numRows);
                this.$announcer.announce('Rows added. Total number of rows: ' + this.dataStore.numRows);

                // Scroll after row adding has been processed.
                setTimeout(() => this.$emit('triggerScrollLastGridRowWithData'), 0);
            }
        },

        fillColumn() {
            const equation = this.fillEquation?.trim();
            const destinationColumn = this.fillEquationColumn;

            if (equation) {
                try {
                    this.dataStore.fillColumn({
                        columnName: destinationColumn,
                        equation
                    });

                    let announcement = 'Column ' + destinationColumn + ' filled.';

                    // Row 0 holds the column headers, which are not filled
                    const columnData = this.dataStore.column(destinationColumn).slice(1);
                    const numValuesToAnnounce = Math.min(5, columnData.length);
                    if (numValuesToAnnounce > 0) {
                        announcement += ' First values are ';
                        for (let i = 0; i < numValuesToAnnounce; ++i) {
                            announcement += i > 0 ?
                                ', ' + columnData[i] :
                                columnData[i];
                        }
                        announcement += '.';
                    }

                    this.$announcer.announce(announcement);
                } catch (e) {
                    alert('Error filling column: ' + (e as Error).message);
                }
            }
        }
    }
});
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

    .grid-controls {
        margin: 0 0 10px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        .se-dropdown {
            width: 80px;
        }
        fieldset {
            border: 0;
            display: flex;
            align-items: flex-end;
        }
        legend {
            font-size: 0.8125rem;
            margin-left: 8px;
            margin-bottom: 1px;
        }
    }

    .grid-controls-group {
        display: flex;
        align-items: flex-end;
    }

    .grid-control-item {
        margin: 5px;
    }

    .grid-controls-center {
        align-self: center;
    }

    .equation-input {
        padding-right: 1.6rem;
    }

    input[type="number"], :deep(.se-control-content input) {
        display: block;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: normal;
        line-height: 1;
        padding: .30em 0.7em .31em .7em;
        height: 1.875rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0;
        border: 1px solid @seinput-border-color;
        border-radius: 4px;
    }

    input[type="number"] {
        align-self: center;
        width: 3.4375rem;
        margin: 0 8px;
    }

    .add-btn {
        margin-left: 4px;
    }

    .expand {
        flex: 1;
        justify-content: center;
        fieldset {
            flex: 1;
        }
    }

    .grid-controls-group.expand {
        margin: 0 40px;
    }

    .control-label, :deep(.se-control-label) {
        font-size: 0.8125rem;
    }

    label.control-label {
        margin-bottom: 5px;
        display: block;
    }
</style>
