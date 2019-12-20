<!--
    A reusable checkbox with consistent cross-browser styling,
    and slightly larger than default area.

    Props:
        - id: String - Input element id.
-->
<template>
    <input
        :id="id"
        type="checkbox"
    >
</template>

<script lang="ts">
export default {
    props: {
        id: { type: String, required: true }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    input {
        cursor: pointer;
        width: 19px;
        height: 19px;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border: 1px solid @secheckbox-border-color;
        border-radius: 4px;
        background-color: @secheckbox-bg;
        position: relative;
        &:hover {
            border-color: @secheckbox-hover-border-color;
            background-color: darken(@secheckbox-bg, 3%);
        }
        &:active {
            background-color: darken(@secheckbox-bg, 8%);
        }
        &::before {
            content: '\2713';
            opacity: 0;
            transition: all 0.18s;
            font-size: 14px;
            text-shadow: 1px 1px 3px rgba(80, 80, 100, 0.8);
            display: block;
            text-align: center;
            color: @secheckbox-color;
            transform: scaleY(0);
            position: absolute;
            top: 4px;
        }
        &:checked {
            background-color: @secheckbox-checked-bg;
            border-color: @secheckbox-checked-bg;
            &::before {
                transform: scaleY(1);
                color: @secheckbox-checked-color;
                opacity: 1;
                top: 0;
                left: 3px;
            }
        }
    }

    input[type="checkbox"]::-moz-focus-inner {
        border: 0;
    }
</style>
