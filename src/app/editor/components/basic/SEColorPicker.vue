<!--
    A reusable color picker.

    Props:
        - id: String - Input element id.
        - [value]: String - Value to display.

    Events:
        - input: Re-emits the input event for use with v-model.
-->
<template>
    <input
        :id="id"
        type="color"
        :value="value"
        @input="$emit('input', $event.target.value)"
    >
</template>

<script lang="ts">
export default {
    props: {
        id: { type: String, required: true },
        value: { type: String, default: '#ffffff' }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    input {
        margin-top: 4px;
        box-sizing: border-box;
        width: 100%;
        min-width: 100px;
        min-height: 28px;
        font-size: 1.04em;
        border: 1px solid @secolorpicker-border-color;
        border-radius: 4px;
        background-color: @secolorpicker-bg;
        cursor: pointer;
        color: @secolorpicker-color;
    }
</style>
