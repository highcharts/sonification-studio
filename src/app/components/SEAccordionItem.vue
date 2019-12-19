<template>
    <div class="se-accordion-item">
        <h3>
            <button
                :class="{ selected: isSelected }"
                :aria-expanded="isSelected"
                :aria-controls="contentId"
                @click="isSelected = !isSelected"
            >
                {{ heading }}
            </button>
        </h3>
        <div v-show="isSelected">
            <slot :id="contentId" />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        heading: { type: String, required: true },
        contentId: { type: String, required: true },
        selected: { type: Boolean, default: false }
    },
    data: function () {
        return {
            isSelected: false
        };
    },
    created: function () {
        this.isSelected = this.selected;
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    button {
        margin: 0;
        padding: 4px 25px;
        width: 100%;
        background-color: @setabswitch-bg;
        color: @setabswitch-color;
        border: 1px solid @setabswitch-color;
        border-radius: 0;
        font: inherit;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        display: block;
        &:hover {
            background-color: @setabswitch-hover-bg;
            color: @setabswitch-hover-color;
        }
        &:active {
            background-color: darken(@setabswitch-hover-bg, 5%);
            color: darken(@setabswitch-hover-color, 5%);
        }
        &.selected {
            background-color: @setabswitch-selected-bg;
            color: @setabswitch-selected-color;
        }
    }

    button::-moz-focus-inner {
        border: 0;
    }
</style>
