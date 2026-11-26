<!--
    A reusable color picker.

    Props:
        - id: String - Input element id.
        - [modelValue]: String - Value to display.

    Events:
        - update:modelValue: Re-emits the input event for use with v-model.
-->
<template>
    <input
        :id="id"
        type="color"
        :value="modelValue"
        @input="onInput"
    >
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        id: { type: String, required: true },
        modelValue: { type: String, default: '#ffffff' }
    },
    emits: ['update:modelValue'],
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
        min-width: 100px;
        min-height: 1.75rem;
        font-size: 1.04em;
        border: 1px solid @secolorpicker-border-color;
        border-radius: 4px;
        background-color: @secolorpicker-bg;
        cursor: pointer;
        color: @secolorpicker-color;
    }
</style>
