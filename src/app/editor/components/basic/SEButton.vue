<!--
    A reusable button. Fixed height, not fixed width.

    Props:
        - [dark]: Boolean - Alternate styling for a dark button.
        - [wide]: Boolean - Alternate styling for a wider button.
        - [aria-expanded]: Boolean - Aria-expanded attribute for the button.
        - [aria-label]: String - Aria-label attribute for the button.
-->
<template>
    <button
        class="se-button"
        :class="{ dark: dark, wide: wide }"
        :aria-expanded="ariaExpanded ? 'true' : ariaExpanded === false ? 'false' : void 0"
        :aria-label="ariaLabel"
        @click="$emit('click', $event)"
        @keydown="$emit('keydown', $event)"
    >
        <slot />
    </button>
</template>

<script lang="ts">
export default {
    props: {
        dark: { type: Boolean, default: false },
        wide: { type: Boolean, default: false },
        ariaExpanded: { type: Boolean, default: null },
        ariaLabel: { type: String, default: null }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    button {
        margin: 5px;
        padding: 6px 15px;
        background-color: @sebutton-bg;
        color: @sebutton-color;
        border: 1px solid @sebutton-color;
        border-radius: 14px;
        font: inherit;
        font-size: 0.875rem;
        font-weight: bold;
        cursor: pointer;
        display: block;
        &:hover {
            background-color: @sebutton-hover-bg;
            color: @sebutton-hover-color;
        }
        &:active {
            background-color: darken(@sebutton-hover-bg, 5%);
            color: darken(@sebutton-hover-color, 5%);
        }
    }

    .dark {
        background-color: @sebutton-dark-bg;
        color: @sebutton-dark-color;
        border: 1px solid @sebutton-dark-bg;
        &:hover {
            background-color: @sebutton-dark-hover-bg;
            color: @sebutton-dark-hover-color;
            border-color: @sebutton-dark-hover-color;
        }
        &:active {
            background-color: darken(@sebutton-dark-hover-bg, 3%);
            color: darken(@sebutton-dark-hover-color, 3%);
        }
    }

    .wide {
        padding: 6px 30px;
    }

    button::-moz-focus-inner {
        border: 0;
    }
</style>
