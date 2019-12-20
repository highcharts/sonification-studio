<!--
    A reusable radio group.

    Props:
        - options: Array<{ label, value, selected? }> - The radio options.
-->
<template>
    <div class="seradio-group">
        <div
            v-for="btn in radioButtons"
            :key="btn.value"
            class="seradio-item"
        >
            <label :for="btn.id">
                {{ btn.label }}
            </label>
            <input
                :id="btn.id"
                type="radio"
                :name="groupId"
                :value="btn.value"
                :checked="btn.selected"
            >
        </div>
    </div>
</template>

<script lang="ts">
interface SERadioButtonDefinition {
    label: string;
    value: string;
    selected: boolean;
    id?: string;
}

function getUniqueId(val: string): string {
    const now = Date.now();
    const unique = Math.round(Math.random() * 10000).toString(16);

    return `'seradio-group-${val}-${now}-${unique}`;
}

export default {
    props: {
        options: { type: Array, required: true }
    },

    computed: {
        radioButtons: function () {
            const options = this.options as Array<SERadioButtonDefinition>;
            return options.map((button: SERadioButtonDefinition) => {
                return Object.assign({
                    id: getUniqueId(button.value)
                }, button);
            });
        },

        groupId: function () {
            return getUniqueId('group');
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .seradio-group {
        display: flex;
        flex-wrap: wrap;
        width: 100%;

        .seradio-item {
            display: flex;
            flex-direction: row-reverse;
            justify-content: center;
            align-items: center;
            margin: 0 5px;
            input {
                cursor: pointer;
                display: block;
                margin: 3px;
            }
            label {
                cursor: pointer;
                margin: 3px;
            }
        }
    }

    input[type="radio"]::-moz-focus-inner {
        border: 0;
    }
</style>
