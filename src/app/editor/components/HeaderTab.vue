<template>
    <button
        class="header-tab"
        :class="{ selected: selected, small: small }"
        tabindex="-1"
        @click="$emit('click')"
    >
        <span
            v-if="!!icon"
        >
            <img
                alt=""
                class="header-tab-btn-icon"
                :src="icon"
            >
        </span>
        <span class="header-tab-btn-text">
            <slot />
        </span>
    </button>
</template>

<script lang="ts">
export default {
    props: {
        selected: { type: Boolean, default: false },
        small: { type: Boolean, default: false },
        icon: { type: String, default: '' }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    button {
        background-color: @header-tab-btn-bg;
        color: @header-tab-btn-color;
        border: none;
        border-bottom: 2px solid @header-tab-unsel-border;
        font: inherit;
        font-size: 1.125rem;
        cursor: pointer;
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
        font-weight: bold;
        border-bottom: 2px solid @header-tab-btn-selected-bg;
        .header-tab-btn-icon {
            filter: invert();
        }
    }

    .header-tab-btn-icon {
        width: 18px;
        height: 18px;
        vertical-align: middle;
        margin-right: 4px;
        filter: contrast(30%) sepia() hue-rotate(200deg) saturate(200%) brightness(70%);
    }

    .small {
        font-size: 0.9375rem;
        .header-tab-btn-icon {
            width: 16px;
            height: 16px;
            padding-bottom: 2px;
        }
    }
</style>
