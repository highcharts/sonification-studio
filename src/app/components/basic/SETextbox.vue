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
        :value="value"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event)"
        @keydown="$emit('keydown', $event)"
    >
</template>

<script lang="ts">
export default {
    props: {
        id: { type: String, required: true },
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
        font-size: 1.04em;
        border: 1px solid @setextbox-border-color;
        border-radius: 4px;
        background-color: @setextbox-bg;
        padding: 6px 9px;
        color: @setextbox-color;

        &:focus {
            border: 1px solid @setextbox-focus-border-color;
            box-shadow: 0 0 5px @setextbox-shadow;
            outline: none;
        }
    }
</style>
