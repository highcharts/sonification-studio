<!--
    A reusable slider with consistent cross-browser styling.

    Props:
        - id: String - Id for the slider. Automatically set on the input control.
        - [label]: String - Label text to add to the slider.
        - [labelledby]: String - ID of external label.
        - [min]: Number - Min value for slider.
        - [max]: Number - Max value for slider.
        - [value]: Number - Current slider value (one-way binding only).
        - [step]: Number - Step for slider values.
        - [dark]: Boolean - Alternate styling for dark backgrounds.
        - [disabled]: Boolean - Do not allow user input.
        - [showValueInput]: Boolean - Display value of slider in an input box.
        - [showPctInLabel]: Boolean - Display percentage value of slider after the label.

    Events:
        - input: Re-emits the input event for use with v-model.
-->
<template>
    <div class="se-slider">
        <label
            v-if="label"
            :id="uuid"
            :for="id"
            :class="{ dark: dark }"
        >
            {{ label }}
            <span
                v-if="showValueInLabel"
                class="label-value"
            >
                {{ value + '' + (valueIsPct ? '%' : '') }}
            </span>
        </label>
        <div class="se-slider-inner">
            <input
                v-if="showValueInput"
                type="number"
                class="se-slider-value-label"
                :aria-labelledby="label && uuid || labelledby"
                :disabled="disabled"
                :min="min"
                :max="max"
                :value="value"
                :step="step"
                :class="{ dark: dark }"
                :style="'width:' + (Math.round(max).toString().length * 14) + 'px'"
                @click="$event.target.select()"
                @input="$emit('input', $event.target.value || 0)"
            >
            <input
                :id="id"
                type="range"
                :disabled="disabled"
                :min="min"
                :max="max"
                :value="value"
                :step="step"
                :class="{ dark, disabled }"
                @input="$emit('input', $event.target.value || 0)"
            >
        </div>
    </div>
</template>

<script lang="ts">
import { getUUID } from '../../../core/utils/objects';

export default {
    props: {
        id: { type: String, required: true },
        label: { type: String, default: '' },
        labelledby: { type: String, default: '' },
        dark: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        showValueInput: { type: Boolean, default: true },
        showValueInLabel: { type: Boolean, default: false },
        valueIsPct: { type: Boolean, default: false },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        value: { type: Number, default: 50 },
        step: { type: Number, default: 1 }
    },
    data() {
        return { uuid: '' };
    },
    beforeMount() {
        this.uuid = getUUID('se-slider');
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

    .se-slider-inner {
        display: flex;
    }

    .se-slider-value-label {
        color: @seslider-value-text-color;
        border: 1px solid @seslider-value-border-color;
        border-radius: 4px;
        text-align: center;
        &.dark {
            color: white;
        }
        margin-right: 8px;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield;
    }

    .dark {
        color: @seslider-dark-color;
    }

    .track(@color, @border) {
        width: 100%;
        height: 4px;
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

    input[type=range] {
        -webkit-appearance: none;
        background: transparent;
        margin: 8px 0;
        width: 100%;
        cursor: pointer;

        .inputStyles(@seslider-color, 1px solid @seslider-border-color);

        &.dark {
            .inputStyles(@seslider-dark-color, none);
        }

        &.disabled {
            cursor: default;
        }
    }

    input[type=range]::-moz-focus-outer {
        border: 0;
    }

    .label-value {
        font-size: 0.85em;
        opacity: 0.9;
        padding-left: 6px;
        margin-left: 6px;
        border-left: 1px solid white;
    }
</style>
