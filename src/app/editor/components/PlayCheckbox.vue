<template>
    <div class="play-checkbox">
        <label :class="{ checked: modelValue }">
            <img
                alt=""
                :src="iconPath"
            >
            <span class="play-checkbox-text">
                <slot />
            </span>
            <input
                type="checkbox"
                class="chk"
                :checked="modelValue"
                @keydown.enter="onEnter"
                @input="onInput"
            >
        </label>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        iconPath: { type: String, required: true },
        modelValue: { type: Boolean, default: false }
    },
    emits: ['update:modelValue'],
    methods: {
        // Native checkboxes don't toggle on Enter, so we do it here
        onEnter(e: KeyboardEvent) {
            const chk = e.target as HTMLInputElement;
            chk.checked = !chk.checked;
            this.$emit('update:modelValue', chk.checked);
        },
        onInput(e: Event) {
            this.$emit('update:modelValue', (e.target as HTMLInputElement).checked);
        }
    }
});
</script>

<style lang="less" scoped>
    @import "../colors";

    .play-checkbox {
        font: inherit;
        width: 3.2rem;
        label {
            padding: 5px 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background: none;
            position: relative;
            color: @play-controls-color;
            border: 2px solid transparent;
            &.checked {
                color: @dark-blue-6;
                background-color: rgba(54, 116, 177, 0.3);
                border-bottom: 2px solid #7683AD;
                img {
                    filter: brightness(135%);
                }
            }
        }
        .chk {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
            appearance: none;
            -moz-appearance: none;
            -webkit-appearance: none;
            cursor: pointer;
            &::before {
                opacity: 0;
            }
        }
        .play-checkbox-text {
            display: block;
        }
        img {
            display: block;
            width: 16px;
            height: $width;
            margin: 6px auto;
        }
        &:hover {
            label {
                color: @play-btn-hover-color;
                img {
                    filter: sepia(100%) saturate(800%) hue-rotate(170deg) brightness(98%);
                }
            }
        }
    }
</style>
