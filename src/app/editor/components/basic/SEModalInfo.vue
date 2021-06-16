<!--
    A reusable modal info dialog.
    Use slot for content.
    More elaborate than SEModalMessage.
-->
<template>
    <div
        ref="outerContainer"
        class="popup-outer-container"
        tabindex="-1"
        role="dialog"
        :aria-label="dialogTitle"
        aria-modal="true"
        @click="onclick"
        @keydown.enter="$emit('close')"
        @keydown.space="$emit('close')"
        @keydown.tab="ontab"
    >
        <div
            ref="innerContainer"
            class="popup-container"
        >
            <div class="popup-header">
                <div>
                    <img
                        :src="hcLogo"
                        alt=""
                    >
                    <span>Highcharts Sonification Studio - {{ dialogTitle }}</span>
                </div>
                <div class="spacer" />
                <button
                    ref="closeIcon"
                    aria-label="Close dialog"
                    class="header-close"
                    @click="$emit('close')"
                >
                    <img
                        :src="closeIcon"
                        alt=""
                    >
                </button>
            </div>
            <div class="popup-content">
                <slot />
            </div>
            <div class="popup-footer">
                <SEButton
                    ref="closeBtn"
                    dark
                    aria-label="Close dialog"
                    @click="$emit('close')"
                >
                    Close
                </SEButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import SEButton from './SEButton.vue';
import hcLogo from '../../assets/highcharts-logo.svg';
import closeIcon from '../../assets/times-solid.svg';

export default {
    components: { SEButton },
    props: {
        dialogTitle: { type: String, default: 'Information' }
    },
    data() { return { hcLogo, closeIcon }; },
    methods: {
        onclick(e: MouseEvent) {
            const innerContainer = this.$refs.innerContainer as Element;
            if (!innerContainer.contains(e.target as Element)) {
                this.$emit('close');
            }
        },
        ontab(e: KeyboardEvent) {
            const atCloseIcon = e.target === this.$refs.closeIcon;
            const atCloseBtn = e.target === (this.$refs.closeBtn as Vue).$el;
            if (atCloseIcon && e.shiftKey || atCloseBtn && !e.shiftKey) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .popup-outer-container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        z-index: 999;
        justify-content: center;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.35);
    }

    .spacer {
        flex: 1;
    }

    .popup-container {
        overflow: auto;
        max-width: 700px;
        max-height: 100vh;
        background-color: @white;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.45);
    }

    .popup-header {
        width: 100%;
        margin: 0;
        background-color: @dark-blue-5;
        color: @white;
        padding: 10px 20px;
        padding-right: 15px;
        box-sizing: border-box;
        vertical-align: middle;
        line-height: 24px;
        font-family: Verdana, sans-serif;
        font-size: 14px;
        display: flex;
        img {
            vertical-align: middle;
            height: 24px;
            width: 24px;
            margin-top: -3px;
            margin-right: 3px;
        }
    }

    .header-close {
        margin-left: 15px;
        font: inherit;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        background: transparent;
        color: @white;
        border: none;
        vertical-align: middle;
        img {
            width: 18px;
            height: 18px;
            margin-right: 0;
            transition: all 0.2s;
        }
        &:hover {
            img {
                transform: scale(1.08);
            }
        }
    }

    button::-moz-focus-inner {
        border: 0;
    }

    .popup-footer {
        width: 100%;
        margin-bottom: 10px;
        button {
            margin: 0 auto;
        }
    }

    .popup-content {
        padding: 25px 40px 20px;
    }
</style>
