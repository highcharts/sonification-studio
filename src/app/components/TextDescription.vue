<template>
    <section aria-label="Text description">
        <h2>Text Description</h2>
        <div id="textdesc-controls">
            <SEDropdown
                v-model="selectedColumn"
                :options="dropdownList"
                label="Choose column to describe"
            />
            <SEButton
                dark
                wide
                @click="describeColumn"
            >
                Text Description
            </SEButton>
            <SEButton
                dark
                wide
            >
                Speak
            </SEButton>
        </div>
        <textarea
            :value="textDescription"
            disabled
        />
    </section>
</template>

<script lang="ts">
import SEButton from './basic/SEButton.vue';
import SEDropdown from './basic/SEDropdown.vue';
import { GenericObject } from '../../core/utils/objects';
import { describeColumn } from '../../core/textDescription';

export default {
    components: {
        SEButton, SEDropdown
    },
    data: function () {
        return {
            selectedColumn: null,
            textDescription: ''
        };
    },
    computed: {
        dropdownList: function () {
            const colsWithData: Array<number> = this.$store.getters['dataStore/tableColumnNamesWithData'];
            const dropdownOptions = colsWithData.map((colName): GenericObject => ({
                name: 'Column ' + colName,
                value: colName
            }));

            return dropdownOptions;
        }
    },
    methods: {
        describeColumn: function () {
            const columnData = this.$store.getters['dataStore/column'](this.selectedColumn);
            this.textDescription = describeColumn(columnData);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        background-color: @main-content-bg-color;
        display: flex;
        flex-direction: column;
        padding: 30px;
    }

    h2 {
        font-size: 21px;
        color: @text-description-heading-color;
        margin-bottom: 10px;
        font-weight: normal;
    }

    #textdesc-controls {
        display: flex;
        align-items: center;
        margin: 5px 0;
    }

    .se-dropdown {
        margin-right: 10px;
        width: 160px;
    }

    textarea {
        flex: 1;
        resize: none;
        margin-top: 10px;
        padding: 5px;
        border: 1px solid @text-description-border-color;
        &:focus {
            outline: 2px solid @text-description-focus-color;
        }
        font-size: 14px;
    }
</style>
