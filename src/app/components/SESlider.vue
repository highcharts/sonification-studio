<template>
    <div class="se-slider">
        <label
            :for="id"
            :class="{ dark: dark }"
        >
            <slot />
        </label>
        <div class="se-slider-inner">
            <input
                :id="id"
                type="range"
                :min="min"
                :max="max"
                :value="value"
                :step="step"
                :class="{ dark: dark }"
            >
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        dark: { type: Boolean, default: false },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        value: { type: Number, default: 50 },
        step: { type: Number, default: 1 },
        id: { type: String, required: true },
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .se-slider {
        display: flex;
        flex-direction: column;
        color: @seslider-color;
    }

    .dark {
        color: @seslider-dark-color;
    }

    .se-slider-inner {
        height: 20px;
    }

    .track(@color) {
        width: 100%;
        height: 4px;
        cursor: pointer;
        border-radius: 5px;
        background: @color;
    }

    .thumb(@color) {
        border: 1px solid @seslider-border-color;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: @color;
        cursor: pointer;
    }

    .inputStyles(@inputColor) {
        &::-moz-range-track {
            .track(@inputColor);
        }

        &::-webkit-slider-runnable-track {
            .track(@inputColor);
            height: 5px;
        }

        &::-moz-range-thumb {
            .thumb(@inputColor);
        }

        &::-ms-thumb {
            .thumb(@inputColor);
        }

        &::-webkit-slider-thumb {
            .thumb(@inputColor);
            -webkit-appearance: none;
            margin-top: -6px;
        }

        &::-moz-range-progress {
            .track(@inputColor);
            background: @seslider-progress-color;
        }

        &::-ms-track {
            .track(@inputColor);
            background: transparent;
            border-color: transparent;
            border-width: 16px 0;
            color: transparent;
        }

        &::-ms-fill-lower {
            background: @seslider-progress-color;
            border-radius: 5px;
        }

        &::-ms-fill-upper {
            background: @seslider-color;
            border-radius: 5px;
        }
    }

    input {
        -webkit-appearance: none;
        background: transparent;
        margin: 8px 0;
        width: 100%;

        .inputStyles(@seslider-color);

        &.dark {
            .inputStyles(@seslider-dark-color);
        }
    }

    input[type=range]::-moz-focus-outer {
        border: 0;
    }
</style>
