<!--
    A reusable radio group.

    Props:
        - options: Array<{ label, value, selected? }> - The radio options.
        - [id]: String - Id to put on the group.
        - [modelValue]: String - Value of the selected radio button.

    Events:
        - update:modelValue: Re-emits the input event for use with v-model.
-->
<template>
    <div
        :id="id || undefined"
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
                :checked="modelValue === btn.value || btn.selected"
                @input="onInput"
            >
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export interface SERadioButtonDefinition {
    label: string;
    value: string;
    selected?: boolean;
    id?: string;
}

function getUniqueId(val: string): string {
    const now = Date.now();
    const unique = Math.round(Math.random() * 10000).toString(16);

    return `seradio-group-${val}-${now}-${unique}`;
}

export default defineComponent({
    props: {
        options: { type: Array as PropType<SERadioButtonDefinition[]>, required: true },
        id: { type: String, default: '' },
        modelValue: { type: String, default: '' }
    },
    emits: ['update:modelValue'],

    computed: {
        radioButtons(): SERadioButtonDefinition[] {
            return this.options.map((button: SERadioButtonDefinition) => {
                return Object.assign({
                    id: getUniqueId(button.value)
                }, button);
            });
        },

        groupId(): string {
            return getUniqueId('group');
        }
    },

    methods: {
        onInput(e: Event) {
            this.$emit('update:modelValue', (e.target as HTMLInputElement).value);
        }
    }
});
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
