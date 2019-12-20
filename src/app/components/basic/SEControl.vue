<!--
    A reusable control with a label and a helptext.
    The input control is placed within the default slot.

    Props:
        - label: String - The label text to show.
        - controlId: String - Id of the input control.
        - [helptext]: String - Show help icon with text popup.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
-->
<template>
    <div
        class="se-control"
        :class="{ horizontal: horizontal }"
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
                @click="helptextActive = !helptextActive"
                @keyup.esc="helptextActive = false"
            >
                ?
            </button>
            <div
                v-show="helptextActive"
                class="helptext-popup"
                @click="helptextActive = false"
            >
                <p>{{ helptext }}</p>
                <div class="helptext-arrow" />
            </div>
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
        horizontal: { type: Boolean, default: false }
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
        align-items: center;
        width: 100%;
        &.horizontal {
            flex-direction: row-reverse;
            justify-content: flex-end;
            .se-control-label {
                margin-left: 10px;
            }
        }
    }

    .se-control-content {
        flex: 1;
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
        padding-left: 0.5px;
        width: 18px;
        height: $width;
        overflow: hidden;
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

    .helptext-popup {
        cursor: pointer;
        position: absolute;
        box-shadow: 0 1px 10px @secontrol-helptext-shadow;
        width: 200px;
        right: -89px;
        bottom: 0;
        font-size: 12px;
        margin-bottom: 30px;
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
