<!--
    A reusable dropdown list. Provide options through props.

    Props:
        - id: String - Element id.
        - options: Array<{ name, value }> - Options in the dropdown. A null
            value is rendered as "" (Vue 3 would drop the attribute and use
            the option text as value).
        - [modelValue]: String - Value of the option to select.
        - [label]: String - Aria label for the dropdown.
        - [labelledby]: String - Aria labelledby for the dropdown.

    Events:
        - update:modelValue: Re-emits the change event for use with v-model.
            Also emitted after every update with the selected value, and before
            mount with the first option's value if no value is given.
-->
<template>
    <div class="se-dropdown sedropdown-container">
        <select
            :id="id"
            ref="SEDropdown_select"
            :value="modelValue"
            :aria-label="label"
            :aria-labelledby="labelledby"
            @change="onChange"
        >
            <option
                v-for="opt in options"
                :key="opt.name"
                :value="opt.value ?? ''"
            >
                {{ opt.name }}
            </option>
        </select>
        <img
            alt=""
            aria-hidden="true"
            :src="arrowIcon"
        >
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import arrowIcon from '../../assets/arrow-down.svg';

export interface SEDropdownOption {
    name: string;
    // null is rendered as ''
    value: string | null;
}

export default defineComponent({
    props: {
        id: { type: String, required: true },
        options: { type: Array as PropType<SEDropdownOption[]>, required: true },
        modelValue: { type: String, default: '' },
        label: { type: String, default: null },
        labelledby: { type: String, default: null }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            arrowIcon
        };
    },
    updated() {
        const sel = this.$refs.SEDropdown_select as HTMLSelectElement;
        const newVal = sel.value;
        this.$emit('update:modelValue', newVal);
    },
    beforeMount() {
        if (!this.options.length) {
            return;
        }

        // If no option is selected, we select the first one
        if (!this.modelValue) {
            const firstOption = this.options[0];
            this.$emit('update:modelValue', firstOption.value);
        }
    },
    methods: {
        onChange(e: Event) {
            this.$emit('update:modelValue', (e.target as HTMLSelectElement).value);
        }
    }
});
</script>

<style lang="less" scoped>
    @import "../../colors";

    .sedropdown-container {
        position: relative;
        width: 100%;
        &:hover {
            img {
                filter: brightness(120%) sepia(100%) saturate(600%) hue-rotate(200deg) brightness(95%);
            }
            select {
                border-color: @sedropdown-hover-border-color;
            }
        }
    }

    select {
        display: block;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: normal;
        line-height: 1;
        padding: .4em 1.2em .4em .7em;
        width: 100%;
        height: 1.875rem;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0;
        border: 1px solid @sedropdown-border-color;
        border-radius: 4px;
        -moz-appearance: none;
        -webkit-appearance: none;
        appearance: none;
        background-color: @sedropdown-bg;
    }

    select:-moz-focusring {
        color: transparent;
        text-shadow: 0 0 0 #000;
    }

    img {
        position: absolute;
        top: 2px;
        right: 5px;
        pointer-events: none;
        width: 1.125rem;
        height: $width;
        transition: filter 0.4s;
    }
</style>
