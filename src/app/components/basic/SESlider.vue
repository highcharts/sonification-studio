<!--
    A reusable slider with consistent cross-browser styling.
    Provide label for the slider in default slot. For external label,
    provide empty slot and set the "labelledby" prop.

    Props:
        - [id]: String - Id for the slider. Automatically set on the input control.
        - [min]: Number - Min value for slider.
        - [max]: Number - Max value for slider.
        - [value]: Number - Current slider value (one-way binding only).
        - [step]: Number - Step for slider values.
        - [dark]: Boolean - Alternate styling for dark backgrounds.
        - [labelledby]: String - Aria-labelledby for slider, in case of external label.
-->
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
                :id="id || null"
                type="range"
                :min="min"
                :max="max"
                :value="value"
                :step="step"
                :class="{ dark: dark }"
                :aria-labelledby="labelledby || null"
            >
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        id: { type: String, default: '' },
        dark: { type: Boolean, default: false },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        value: { type: Number, default: 50 },
        step: { type: Number, default: 1 },
        labelledby: { type: String, default: '' }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

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

    .track(@color, @border-color) {
        width: 100%;
        height: 4px;
        cursor: pointer;
        border-radius: 5px;
        border: 1px solid @border-color;
        background: @color;
    }

    .thumb(@color, @border-color) {
        border: 1px solid @border-color;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: @color;
        cursor: pointer;
    }

    .inputStyles(@inputColor, @border-color) {
        &::-moz-range-track {
            .track(@inputColor, @border-color);
        }

        &::-webkit-slider-runnable-track {
            .track(@inputColor, @border-color);
            height: 5px;
        }

        &::-moz-range-thumb {
            .thumb(@inputColor, @border-color);
        }

        &::-ms-thumb {
            .thumb(@inputColor, @border-color);
        }

        &::-webkit-slider-thumb {
            .thumb(@inputColor, @border-color);
            -webkit-appearance: none;
            margin-top: -6.5px;
        }

        &::-moz-range-progress {
            .track(@inputColor, @border-color);
            background: @seslider-progress-color;
        }

        &::-ms-track {
            .track(@inputColor, @border-color);
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

        .inputStyles(@seslider-color, @seslider-border-color);

        &.dark {
            .inputStyles(@seslider-dark-color, @seslider-dark-border-color);
        }
    }

    input[type=range]::-moz-focus-outer {
        border: 0;
    }
</style>
