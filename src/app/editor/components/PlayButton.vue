<template>
    <div class="play-button">
        <button
            :disabled="enabled ? null : true"
            @click="$emit('click')"
            @mouseup="$emit('mouseup', $event)"
            @mousedown="$emit('mousedown', $event)"
            @keydown="$emit('keydown', $event)"
            @keyup="$emit('keyup', $event)"
        >
            <img
                alt=""
                :src="iconPath"
            >
            <span class="play-button-content">
                <slot />
            </span>
        </button>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        iconPath: { type: String, required: true },
        enabled: { type: Boolean, default: true }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    button {
        padding: 5px 8px;
        width: 3.2rem;
        background: none;
        color: @play-controls-color;
        font: inherit;
        cursor: pointer;
        border: 2px solid transparent;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &:hover:not(:disabled) {
            color: @play-btn-hover-color;
            img {
                filter: sepia(100%) saturate(700%) hue-rotate(170deg) brightness(95%);
            }
        }
        &:active:not(:disabled) {
            img {
                filter: sepia(100%) saturate(700%) hue-rotate(170deg) brightness(90%);
            }
            color: darken(@play-btn-hover-color, 5%);
        }
        &:disabled {
            opacity: 0.5;
            cursor: default;
        }
        img {
            width: 16px;
            height: $width;
            margin: 6px auto;
        }
    }

    button::-moz-focus-inner {
        border: 0;
    }
</style>
