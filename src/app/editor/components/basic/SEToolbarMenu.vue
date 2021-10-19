<!--

-->
<template>
    <button
        class="se-toolbar-menu"
        :aria-expanded="ariaExpanded ? 'true' : ariaExpanded === false ? 'false' : void 0"
        @click="$emit('click', $event)"
        @keydown="$emit('keydown', $event)"
    >
        <div class="btn-content">
            <slot />
            <img
                alt=""
                aria-hidden="true"
                :src="arrowIcon"
            >
        </div>
    </button>
</template>

<script lang="ts">
import arrowIcon from '../../assets/arrow-down.svg';
export default {
    props: {
        ariaExpanded: { type: Boolean, default: null }
    },
    data() {
        return {
            arrowIcon
        };
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    button {
        position: relative;
        width: 9.5rem;
        margin: 0 5px;
        background-color: @sebutton-bg;
        color: @sebutton-color;
        border: none;
        font: inherit;
        font-size: 0.875rem;
        height: 2.5rem;
        font-weight: bold;
        cursor: pointer;
        display: block;
        &[aria-expanded="true"] {
            background-color: @sebutton-hover-bg;
            color: @sebutton-hover-color;
            img {
                filter: invert() brightness(130%);
            }
        }
        &:active {
            background-color: darken(@sebutton-hover-bg, 5%);
            color: darken(@sebutton-hover-color, 5%);
        }
    }

    .btn-content {
        position: absolute;
        width: 9.5rem;
        bottom: 10px;
        text-align: center;
    }

    button::-moz-focus-inner {
        border: 0;
    }

    img {
        pointer-events: none;
        width: 1.125rem;
        height: $width;
    }
</style>
