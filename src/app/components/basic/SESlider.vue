<!--
    A reusable slider with consistent cross-browser styling.

    Props:
        - id: String - Id for the slider. Automatically set on the input control.
        - [label]: String - Label text to add to the slider.
        - [min]: Number - Min value for slider.
        - [max]: Number - Max value for slider.
        - [value]: Number - Current slider value (one-way binding only).
        - [step]: Number - Step for slider values.
        - [dark]: Boolean - Alternate styling for dark backgrounds.
-->
<template>
    <div class="se-slider">
        <label
            v-if="label"
            :for="id"
            :class="{ dark: dark }"
        >
            {{ label }}
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
            >
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        id: { type: String, required: true },
        label: { type: String, default: '' },
        dark: { type: Boolean, default: false },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        value: { type: Number, default: 50 },
        step: { type: Number, default: 1 }
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

    .track(@color, @border) {
        width: 100%;
        height: 4px;
        cursor: pointer;
        border-radius: 5px;
        border: @border;
        background: @color;
    }

    .thumb(@color, @border) {
        border: @border;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: @color;
        cursor: pointer;
    }

    .inputStyles(@inputColor, @border) {
        &::-moz-range-track {
            .track(@inputColor, @border);
        }

        &::-webkit-slider-runnable-track {
            .track(@inputColor, @border);
            height: 5px;
        }

        &::-moz-range-thumb {
            .thumb(@inputColor, @border);
        }

        &::-ms-thumb {
            .thumb(@inputColor, @border);
        }

        &::-webkit-slider-thumb {
            .thumb(@inputColor, @border);
            -webkit-appearance: none;
            margin-top: -6px;
        }

        &::-moz-range-progress {
            .track(@inputColor, @border);
            background: @seslider-progress-color;
        }

        &::-ms-track {
            .track(@inputColor, @border);
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

        .inputStyles(@seslider-color, 1px solid @seslider-border-color);

        &.dark {
            .inputStyles(@seslider-dark-color, none);
        }
    }

    input[type=range]::-moz-focus-outer {
        border: 0;
    }
</style>
