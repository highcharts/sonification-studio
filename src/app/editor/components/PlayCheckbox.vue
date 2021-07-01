<template>
    <div class="play-checkbox">
        <label :class="{ checked: value }">
            <img
                alt=""
                :src="iconPath"
            >
            <span class="play-checkbox-text">
                <slot />
            </span>
            <input
                type="checkbox"
                class="sr-only"
                :checked="value"
                @input="$emit('input', $event.target.checked)"
            >
        </label>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        iconPath: { type: String, required: true },
        value: { type: Boolean, default: false }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

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
            color: @play-controls-color;
            border: 2px solid transparent;
            &.checked {
                color: #d6e5f7;
                background-color: rgba(0, 0, 0, 0.3);
                border-bottom: 2px solid #7683AD;
                img {
                    filter: sepia(100%) saturate(800%) hue-rotate(170deg) brightness(95%);
                }
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
    }
</style>
