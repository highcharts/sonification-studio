<!--
    A reusable radio group.

    Props:
        - options: Array<{ label, value, selected? }> - The radio options.
        - [id]: String - Id to put on the group.
        - [value]: String - Value of the selected radio button.
-->
<template>
    <div
        :id="id || null"
        class="seradio-group"
    >
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
                :checked="value === btn.value || btn.selected"
                @input="$emit('input', $event.target.value)"
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

    return `seradio-group-${val}-${now}-${unique}`;
}

export default {
    props: {
        options: { type: Array, required: true },
        id: { type: String, default: '' },
        value: { type: String, default: '' }
    },

    computed: {
        radioButtons() {
            const options = this.options as Array<SERadioButtonDefinition>;
            return options.map((button: SERadioButtonDefinition) => {
                return Object.assign({
                    id: getUniqueId(button.value)
                }, button);
            });
        },

        groupId() {
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
        margin: 3px 0;

        .seradio-item {
            display: flex;
            flex-direction: row-reverse;
            justify-content: center;
            align-items: center;
            input {
                cursor: pointer;
                display: block;
                margin: 3px;
            }
            label {
                cursor: pointer;
                margin: 3px;
            }
            &:not(:last-child) {
                margin-right: 10px;
            }
        }
    }

    input[type="radio"]::-moz-focus-inner {
        border: 0;
    }
</style>
