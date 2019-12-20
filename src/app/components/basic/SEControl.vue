<!--
    A reusable control with a label and a helptext.
    The input control is placed within the default slot.

    Props:
        - label: String - The label text to show.
        - controlId: String - Id of the input control.
        - [helptext]: String - Show help icon with text popup.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
        - [expandContent]: Boolean - Expand the control content to fill empty space.
-->
<template>
    <div
        class="se-control"
        :class="{ horizontal: horizontal, 'expand-content': expandContent }"
    >
        <div class="se-control-label-container">
            <label
                :for="controlId"
                class="se-control-label"
            >
                {{ label }}
            </label>

            <button
                v-if="helptext"
                class="helpicon"
                :aria-label="'Help for ' + label"
                :aria-expanded="helptextActive ? 'true' : 'false'"
                @click="helptextActive = !helptextActive"
                @keyup.esc="helptextActive = false"
            >
                ?

                <div class="helptext-popup-container">
                    <div
                        v-show="helptextActive"
                        class="helptext-popup"
                    >
                        <p>{{ helptext }}</p>
                        <div class="helptext-arrow" />
                    </div>
                </div>
            </button>
        </div>
        <div class="se-control-content">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        label: { type: String, required: true },
        controlId: { type: String, required: true },
        helptext: { type: String, default: '' },
        horizontal: { type: Boolean, default: false },
        expandContent: { type: Boolean, default: false }
    },
    data: function () {
        return {
            helptextActive: false
        };
    },
    mounted: function () {
        document.addEventListener('click', (e: MouseEvent) => {
            if (!this.$el.contains(e.target as any)) {
                this.helptextActive = false;
            }
        });
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .se-control {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        &.horizontal {
            flex-direction: row-reverse;
            justify-content: flex-end;
            align-items: center;
            .se-control-label {
                margin-left: 6px;
                cursor: pointer;
            }
            .se-control-content {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
        &.expand-content .se-control-content {
            flex: 1;
            display: block;
        }
    }

    .se-control-label-container {
        display: flex;
        align-items: center;
        position: relative;
    }

    .se-control-label {
        margin: 3px;
    }

    .helpicon {
        margin: 2px;
        margin-left: 4px;
        width: 18px;
        height: $width;
        background-color: @secontrol-helpicon-bg;
        color: @secontrol-helpicon-color;
        border: 1px solid @secontrol-helpicon-color;
        border-radius: 50%;
        font: inherit;
        font-size: 13px;
        text-align: center;
        font-weight: bold;
        cursor: pointer;
        display: block;
        &:hover {
            background-color: @secontrol-helpicon-hover-bg;
            color: @secontrol-helpicon-hover-color;
            border-color: @secontrol-helpicon-hover-color;
        }
        &:active {
            background-color: darken(@secontrol-helpicon-hover-bg, 5%);
            color: darken(@secontrol-helpicon-hover-color, 5%);
        }
    }

    .helptext-popup-container {
        position: relative;
    }

    .helptext-popup {
        cursor: pointer;
        position: absolute;
        box-shadow: 0 1px 10px @secontrol-helptext-shadow;
        width: 200px;
        right: -92px;
        bottom: 0;
        font-size: 12px;
        font-weight: normal;
        text-align: left;
        margin-bottom: 25px;
        z-index: 99;
        padding: 10px;
        box-sizing: border-box;
        background-color: @secontrol-helptext-bg;
        color: @secontrol-helptext-color;
        .helptext-arrow {
            background-color: @secontrol-helptext-bg;
            width: 16px;
            height: $width;
            position: absolute;
            left: calc(50% - 8px);
            bottom: -4px;
            transform: rotate(45deg);
            z-index: 98;
        }
        p {
            z-index: 100;
            position: relative;
        }
    }

</style>
