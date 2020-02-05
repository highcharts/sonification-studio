<template>
    <div class="play-button">
        <button @click="$emit('click')">
            <img
                alt=""
                :src="iconPath"
            >
            <slot />
        </button>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        iconPath: { type: String, required: true }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    button {
        padding: 5px;
        background: none;
        color: @play-controls-color;
        border: none;
        font: inherit;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        &:hover {
            color: @play-btn-hover-color;
            img {
                filter: sepia(100%) saturate(700%) hue-rotate(170deg) brightness(95%);
            }
        }
        &:active {
            img {
                filter: sepia(100%) saturate(700%) hue-rotate(170deg) brightness(90%);
            }
            color: darken(@play-btn-hover-color, 5%);
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
