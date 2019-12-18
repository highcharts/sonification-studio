<template>
    <div class="grid-controls">
        <div class="grid-controls-group">
            <span
                role="presentation"
                class="control-label grid-controls-center"
            >
                Add
            </span>
            <input
                type="number"
                min="0"
                aria-label="Add rows"
            >
            <span
                role="presentation"
                class="control-label grid-controls-center"
            >
                rows
            </span>
            <SEButton class="add-btn">
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
            <SEButton>Clear data</SEButton>
            <SEButton>Import data</SEButton>
            <SEButton>Export data</SEButton>
        </div>
    </div>
</template>

<script lang="ts">
import SEButton from './SEButton.vue';
import SEDropdown from './SEDropdown.vue';

export default {
    components: {
        SEButton, SEDropdown
    },
    data: function () {
        return {
            fillDropdownList: [
                { name: 'A', value: 'A', selected: true },
                { name: 'B', value: 'B' },
                { name: 'C', value: 'C' },
                { name: 'D', value: 'D' }
            ]
        };
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
