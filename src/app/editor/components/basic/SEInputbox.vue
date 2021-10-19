<!--
    A reusable input textbox.

    Props:
        - id: String - Input element id.
        - [value]: String - Value to display.

    Events:
        - input: Re-emits the input event for use with v-model.
        - change: Re-emits
-->
<template>
    <input
        :id="id"
        class="se-inputbox"
        :value="value"
        :type="type"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event)"
        @keydown="$emit('keydown', $event)"
    >
</template>

<script lang="ts">
export default {
    props: {
        id: { type: String, required: true },
        type: { type: String, default: 'text' },
        value: { type: String, default: '' }
    }
};
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
