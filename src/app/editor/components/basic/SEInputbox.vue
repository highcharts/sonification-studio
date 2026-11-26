<!--
    A reusable input textbox.

    Props:
        - id: String - Input element id.
        - [type]: String - Input type, defaults to text.
        - [modelValue]: String - Value to display.

    Events:
        - update:modelValue: Re-emits the input event for use with v-model.
        - change: Re-emits
        - keydown: Re-emits
-->
<template>
    <input
        :id="id"
        class="se-inputbox"
        :value="modelValue"
        :type="type"
        @input="onInput"
        @change="$emit('change', $event)"
        @keydown="$emit('keydown', $event)"
    >
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        id: { type: String, required: true },
        type: { type: String, default: 'text' },
        modelValue: { type: String, default: '' }
    },
    emits: ['update:modelValue', 'change', 'keydown'],
    methods: {
        onInput(e: Event) {
            this.$emit('update:modelValue', (e.target as HTMLInputElement).value);
        }
    }
});
</script>

<style lang="less" scoped>
    @import "../../colors";

    input {
        margin-top: 4px;
        box-sizing: border-box;
        width: 100%;
        font-size: 0.9em;
        border: 1px solid @se-inputbox-border-color;
        border-radius: 4px;
        background-color: @se-inputbox-bg;
        padding: 6px 9px;
        color: @se-inputbox-color;

        &:focus {
            border: 1px solid @se-inputbox-focus-border-color;
            box-shadow: 0 0 5px @se-inputbox-shadow;
            outline: none;
        }
    }
</style>
