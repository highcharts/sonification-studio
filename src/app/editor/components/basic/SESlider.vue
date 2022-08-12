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
        - [darkOnLight]: Boolean - Alternate dark styling for light backgrounds.
        - [disabled]: Boolean - Do not allow user input.
        - [showValueInput]: Boolean - Display value of slider in an input box.
        - [showPctInLabel]: Boolean - Display percentage value of slider after the label.
        - [arrowThumb]: Boolean - Make the thumb look like an arrow

    Events:
        - input: Re-emits the input event for use with v-model.
-->
<template>
    <div class="se-slider">
        <label
            v-if="label"
            :id="uuid1"
            :for="id"
            :class="{ dark, 'dark-on-light': darkOnLight }"
            class="se-slider-label"
        >
            {{ label }}
            <span
                v-if="showValueInLabel"
                class="label-value"
                :class="{ 'dark-on-light': darkOnLight }"
            >
                {{ value + '' + (valueIsPct ? '%' : '') }}
            </span>
        </label>
        <div class="se-slider-inner">
            <input
                v-if="showValueInput"
                :id="showValueInput ? id : uuid2"
                type="number"
                class="se-slider-value-label"
                :aria-labelledby="label && uuid1 || labelledby"
                :disabled="disabled"
                :min="min"
                :max="max"
                :value="value"
                :step="step"
                :class="{ dark, 'dark-on-light': darkOnLight }"
                :style="'width:' + (Math.round(max).toString().length * 0.875) + 'rem'"
                @click="$event.target.select()"
                @input="oninput"
                @change="onchange"
            >
            <input
                :id="showValueInput ? uuid2 : id"
                type="range"
                :disabled="disabled"
                :aria-hidden="showValueInput"
                :tabindex="showValueInput ? '-1' : '0'"
                :min="min"
                :max="max"
                :value="value"
                :step="step"
                :class="{ dark, 'dark-on-light': darkOnLight, disabled, 'arrow-thumb': arrowThumb }"
                class="se-slider-range-input"
                @input="$emit('input', $event.target.value || 0)"
            >
        </div>
    </div>
</template>

<script lang="ts">
import { getUUID } from '../../core/utils/objects';

export default {
    props: {
        id: { type: String, required: true },
        label: { type: String, default: '' },
        labelledby: { type: String, default: '' },
        dark: { type: Boolean, default: false },
        darkOnLight: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        showValueInput: { type: Boolean, default: true },
        showValueInLabel: { type: Boolean, default: false },
        valueIsPct: { type: Boolean, default: false },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        value: { type: Number, default: 50 },
        step: { type: Number, default: 1 },
        arrowThumb: { type: Boolean, default: false }
    },
    data() {
        return { validityTimer: 0 };
    },
    computed: {
        uuid1: () => getUUID('se-slider'),
        uuid2: () => getUUID('se-slider')
    },
    methods: {
        oninput(e: Event) {
            const target = e.target as HTMLInputElement;
            if (target.checkValidity()) {
                this.$emit('input', target.value || 0);
            } else {
                clearTimeout(this.validityTimer);
                this.validityTimer = setTimeout(() => target.reportValidity(), 1000);
            }
        },
        onchange(e: Event) {
            const target = e.target as HTMLInputElement;
            clearTimeout(this.validityTimer);
            target.reportValidity();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .se-slider {
        display: flex;
        flex-direction: column;
        color: @seslider-color;
        width: 100%;
    }

    .se-slider-inner {
        display: flex;
    }

    .se-slider-value-label {
        color: @seslider-value-text-color;
        border: 1px solid @seslider-value-border-color;
        border-radius: 4px;
        text-align: center;
        font-size: 0.815rem;
        &.dark {
            color: white;
        }
        &.dark-on-light {
            color: @seslider-darkonlight-color;
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

    input[type="number"]:invalid {
        border-color: #E40101;
        box-shadow: 0 0 3px #ff0a0a;
        border-width: 2px;
    }

    .dark {
        color: @seslider-dark-color;
    }

    .dark-on-light {
        color: @seslider-darkonlight-color;
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

    .arrowThumb(@color) {
        width: 0;
        height: 0;
        border-radius: 4px;
        background-color: transparent;
        color: transparent;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-left: 12px solid @color;
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

    .thumbStyles(@color) {
        &::-moz-range-thumb {
            .arrowThumb(@color);
        }
        &::-ms-thumb {
            .arrowThumb(@color);
        }
        &::-webkit-slider-thumb {
            .arrowThumb(@color);
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

        &.dark-on-light {
            .inputStyles(@seslider-darkonlight-color, none);
            &.arrow-thumb {
                .thumbStyles(@seslider-darkonlight-color);
            }
        }

        &.disabled {
            cursor: default;
        }

        &.arrow-thumb {
            .thumbStyles(#fff);
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
        border-left: 1px solid #fff;
        &.dark-on-light {
            border-color: @seslider-darkonlight-color;
        }
    }
</style>
