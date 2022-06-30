<template>
    <div class="show-panel">
        <button
            :aria-label="'Show '+ name"
            :title="'Show ' + name"
            :class="{
                'dir-left': arrowDirection === 'left',
                'dir-right': arrowDirection === 'right',
                'dir-up': arrowDirection === 'up',
                'dir-down': arrowDirection === 'down',
            }"
            @click="$emit('click')"
        >
            <img
                alt=""
                class="arrow-icon"
                :src="arrowRightIcon"
            >
        </button>
    </div>
</template>

<script lang="ts">
import arrowRightIcon from '../assets/arrow-right.svg';

export default {
    props: {
        name: { type: String, required: true },
        arrowDirection: { type: String, required: true }
    },
    data: function () {
        return {
            arrowRightIcon
        };
    },
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .show-panel {
        height: 100%;
        background-color: @show-panel-bg;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        button {
            background-color: @show-panel-bg;
            border: none;
            z-index: 99;
            position: absolute;
            left: -15px;
            cursor: pointer;
            border-radius: 35%;
            width: 20px;
            height: $width + 10;
            &.dir-up {
                .arrow-icon {
                    transform: rotate(270deg);
                }
            }
            &.dir-down {
                .arrow-icon {
                    transform: rotate(90deg);
                }
            }
            &.dir-left {
                .arrow-icon {
                    transform: rotate(180deg);
                }
            }
            &.dir-right {
                .arrow-icon { }
            }
            .arrow-icon {
                filter: invert();
                height: 11px;
                width: $height;
                display: block;
                margin: 0 auto;
            }
        }
    }
</style>
