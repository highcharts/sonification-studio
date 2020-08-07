<!--
    A reusable control with a label and a helptext.
    The input control is placed within the default slot.

    Use slot props to access the ID of the control and the added label. Example:
        <SEControl
            v-slot="slotProps"
            label="My label text"
            helptext="Some help text."
        >
            <SESlider
                :id="slotProps.controlId"
                :labelledby="slotProps.labelId"
            />
        </SEControl>

    controlId is added to the <label>'s "for" attribute, and labelId is the id of the <label>.

    Props:
        - label: String - The label text to show.
        - [helptext]: String - Show help icon with text popup.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
        - [horizontalReverse]: Boolean - Show label to the left of control, rather than above.
        - [expandContent]: Boolean - Expand the control content to fill empty space.
-->
<template>
    <div
        class="se-control"
        :class="{ horizontal: horizontal, 'horizontal-reverse': horizontalReverse, 'expand-content': expandContent }"
    >
        <div class="se-control-label-container">
            <label
                :id="labelUUID"
                :for="controlUUID"
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
            </button>

            <div
                v-show="helptextActive"
                class="helptext-popup-container"
                @click="helptextActive = !helptextActive"
                @keyup.esc="helptextActive = false"
            >
                <div
                    class="helptext-popup"
                >
                    <p>{{ helptext }}</p>
                    <div class="helptext-arrow" />
                </div>
            </div>
        </div>
        <div class="se-control-content">
            <slot
                :labelId="labelUUID"
                :controlId="controlUUID"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { getUUID } from '../../../core/utils/objects';

export default {
    props: {
        label: { type: String, required: true },
        helptext: { type: String, default: '' },
        horizontal: { type: Boolean, default: false },
        horizontalReverse: { type: Boolean, default: false },
        expandContent: { type: Boolean, default: false }
    },
    data() {
        return {
            helptextActive: false,
            labelUUID: '',
            controlUUID: ''
        };
    },
    beforeMount() {
        this.labelUUID = getUUID('se-ctl-label');
        this.controlUUID = getUUID('se-ctl-content');
    },
    mounted() {
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
            }
        }
        &.horizontal-reverse {
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            .se-control-label-container {
                margin-right: 8px;
            }
        }
        &.horizontal, &.horizontal-reverse {
            .se-control-label {
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
        margin: 4px 2px 4px 0;
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
        transition: all 0.1s;
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
        right: -90px;
        bottom: 0;
        font-size: 12px;
        font-weight: normal;
        text-align: left;
        margin-bottom: 20px;
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
