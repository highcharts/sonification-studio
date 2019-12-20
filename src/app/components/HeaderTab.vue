<template>
    <button
        class="header-tab"
        :class="{ selected: selected }"
        @click="$emit('click')"
    >
        <slot />
    </button>
</template>

<script lang="ts">
export default {
    props: {
        selected: { type: Boolean, default: false }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    button {
        background-color: @header-tab-btn-bg;
        color: @header-tab-btn-color;
        border: none;
        font: inherit;
        font-size: 18px;
        cursor: pointer;
        text-decoration: underline;
        display: block;
        height: 100%;
        width: 100%;
        padding: 2px;
        box-sizing: border-box;
    }

    button::-moz-focus-inner {
        border: 0;
    }

    .selected {
        background-color: @header-tab-btn-selected-bg;
        color: @header-tab-btn-selected-color;
        text-decoration: none;
        font-weight: bold;
    }
</style>
