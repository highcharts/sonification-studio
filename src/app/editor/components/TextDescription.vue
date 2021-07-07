<template>
    <div class="textdesc-container">
        <div class="textdesc-heading-row">
            <SEControl
                helptext="Write a description for the chart and sonification here. The description is saved with the project, and can also be saved as a text file.<br>Pressing the &quot;Generate Description&quot; button will create an automatic description of the data."
                helpfor="Text Description"
                horizontal-reverse
            >
                <h3 id="textdesc-heading">
                    Text Description
                </h3>
            </SEControl>

            <SEButton
                dark
                wide
                @click="onGenerateDescription"
            >
                Generate Description
            </SEButton>
        </div>
        <textarea
            ref="description"
            v-model="textDescription"
            aria-labelledby="textdesc-heading"
        />
    </div>
</template>

<script lang="ts">
import SEButton from './basic/SEButton.vue';
import SEControl from './basic/SEControl.vue';
import { GenericObject } from '../core/utils/objects';
import { describeTable } from '../core/textDescription';

export default {
    components: {
        SEButton,
        SEControl
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
                this.$nextTick(() => setTimeout(() => description.focus(), 20));
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
            font-weight: normal;
            margin-bottom: 3px;
            margin-right: 5px;
        }
        .se-control {
            width: auto;
        }
        margin-bottom: 10px;
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
