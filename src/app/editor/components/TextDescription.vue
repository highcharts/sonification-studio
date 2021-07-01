<template>
    <div class="textdesc-container">
        <div class="textdesc-heading-row">
            <h3>
                Text Description
            </h3>

            <SEButton
                dark
                wide
                @click="onGenerateDescription"
            >
                Generate description
            </SEButton>
        </div>
        <textarea
            ref="description"
            v-model="textDescription"
        />
    </div>
</template>

<script lang="ts">
import SEButton from './basic/SEButton.vue';
import { GenericObject } from '../core/utils/objects';
import { describeTable } from '../core/textDescription';

export default {
    components: {
        SEButton
    },
    computed: {
        textDescription: {
            get() { return (this as any).$store.state.dataStore.textDescription; },
            set(desc) { return this.$store.commit('dataStore/setTextDescription', desc); }
        }
    },
    methods: {
        onGenerateDescription() {
            if (!this.textDescription || window.confirm('This will replace the existing description. Continue?')) {
                const columnsWithData = this.$store.getters['dataStore/tableColumnNamesWithData'];
                const columnData = columnsWithData.reduce((acc: GenericObject, columnName: string) => {
                    acc[columnName] = this.$store.getters['dataStore/column'](columnName);
                    return acc;
                }, {});

                this.textDescription = describeTable(columnData);

                const description = this.$refs.description as HTMLElement;
                description.focus();
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .textdesc-container {
        background-color: @main-content-bg-color;
        display: flex;
        flex-direction: column;
        padding: 30px;
    }

    .textdesc-heading-row {
        display: flex;
        width: 100%;
        justify-content: space-between;
        h3 {
            font-size: 1.3125rem;
            color: @text-description-heading-color;
            margin-bottom: 10px;
            font-weight: normal;
        }
    }

    textarea {
        resize: none;
        flex: 1;
        margin-top: 10px;
        padding: 5px;
        border: 1px solid @text-description-border-color;
        &:focus {
            outline: 2px solid @text-description-focus-color;
        }
        font-size: 0.875rem;
    }
</style>
