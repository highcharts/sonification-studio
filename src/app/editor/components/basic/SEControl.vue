<!--
    A reusable control with a label and a helptext. Optionally, fieldset and legend can be used instead of a label.
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
        - [label]: String - The label text to show.
        - [helptext]: String - Show help icon with text popup.
        - [helpfor]: String - Force what to say the help button is for.
        - [helptextBelow]: Boolean - Show helptext popup below instead of above.
        - [helptextMiddle]: Boolean - Helptext popup is positioned in the middle horizontally relative to the button.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
        - [horizontalReverse]: Boolean - Show label to the left of control, rather than above.
        - [helpiconInside]: Boolean - Place the helpicon inside the content, allowing them to overlap.
        - [expandContent]: Boolean - Expand the control content to fill empty space - also when horizontal.
        - [compactContent]: Boolean - Do not expand control content, even when vertical.
        - [isFieldset]: Boolean - Code the control as a fieldset.
        - [fieldsetLegend]: String - Legend to add to fieldset.
-->
<template>
    <component
        :is="isFieldset ? 'fieldset' : 'div'"
        class="se-control"
        :class="{ horizontal: horizontal, 'horizontal-reverse': horizontalReverse, 'expand-content': expandContent, 'compact-content': compactContent, 'helpicon-inside': helpiconInside }"
    >
        <div class="se-control-label-container">
            <legend
                v-if="isFieldset && fieldsetLegend"
            >
                {{ fieldsetLegend }}
            </legend>

            <label
                v-if="label"
                :id="labelUUID"
                :for="controlUUID"
                class="se-control-label"
            >
                {{ label }}
            </label>
        </div>
        <div
            ref="contentSlot"
            class="se-control-content-container"
        >
            <slot
                :labelId="labelUUID"
                :controlId="controlUUID"
            />
        </div>
        <div class="se-control-help-container">
            <button
                v-if="helptext"
                ref="helptextBtn"
                class="helpicon"
                :aria-label="'Help for ' + (helpfor || label || fieldsetLegend)"
                :aria-expanded="helptextActive ? 'true' : 'false'"
                @click="onHelptextBtnClick"
            >
                ?
            </button>

            <div
                v-show="helptextActive"
                ref="helptextPopupContainer"
                class="helptext-popup-container"
                :aria-label="'Help for ' + (helpfor || label || fieldsetLegend)"
                :aria-describedby="helptextContentUUID"
                role="dialog"
                tabindex="-1"
                @keydown.enter="onHelpContainerClick"
                @keydown.space="onHelpContainerClick"
            >
                <div
                    class="helptext-popup"
                    :class="{ below: helptextBelow, middle: helptextMiddle }"
                >
                    <div class="close-btn-container">
                        <span
                            class="helptext-title"
                            aria-hidden="true"
                        >
                            {{ (helpfor || label || fieldsetLegend) }}
                        </span>
                        <button
                            class="close-btn"
                            aria-label="Close dialog"
                            @click="hideDialog"
                        >
                            <img
                                :src="closeIcon"
                                alt=""
                            >
                        </button>
                    </div>
                    <div
                        :id="helptextContentUUID"
                        class="helptext-content-container"
                    >
                        <p
                            v-for="helptextParagraph in helptextParagraphs"
                            :key="helptextParagraph.index"
                        >
                            <span v-html="helptextParagraph.content" />
                        </p>
                    </div>
                    <div
                        class="helptext-arrow"
                        :class="{ below: helptextBelow }"
                    />
                </div>
            </div>
        </div>
    </component>
</template>

<script lang="ts">
import closeIcon from '../../assets/times-solid.svg';
import { getUUID, GenericObject } from '../../core/utils/objects';
import { Keys, keyPressed, Modifiers } from '../../core/utils/keyboardUtils';

export default {
    props: {
        label: { type: String, default: '' },
        helptext: { type: String, default: '' },
        helpfor: { type: String, default: '' },
        horizontal: { type: Boolean, default: false },
        helptextBelow: { type: Boolean, default: false },
        helptextMiddle: { type: Boolean, default: false },
        horizontalReverse: { type: Boolean, default: false },
        helpiconInside: { type: Boolean, default: false },
        expandContent: { type: Boolean, default: false },
        compactContent: { type: Boolean, default: false },
        isFieldset: { type: Boolean, default: false },
        fieldsetLegend: { type: String, default: '' }
    },
    data() {
        return {
            helptextActive: false,
            closeIcon
        };
    },
    computed: {
        labelUUID: () => getUUID('se-ctl-label'),
        controlUUID: () => getUUID('se-ctl-content'),
        helptextContentUUID: () => getUUID('se-ctl-helpcontent'),
        helptextParagraphs: function(): GenericObject[] {
            const arr = this.helptext ? this.helptext.split('<br>') : [];
            return arr.map((x, i) => ({ index: i, content: x }));
        }
    },
    mounted() {
        document.addEventListener('click', (e: MouseEvent) => {
            if (
                this.helptextActive &&
                !(this.$refs as any).contentSlot.contains(e.target as any) &&
                !(this.$refs as any).helptextPopupContainer.contains(e.target as any) &&
                !(this.$refs as any).helptextBtn.contains(e.target as any)
            ) {
                this.helptextActive = false;
            }
        });
        document.addEventListener('keyup', (e: KeyboardEvent) => {
            if (this.helptextActive && keyPressed(Keys.Esc, Modifiers.None, e)) {
                e.preventDefault();
                if (e.target === (this.$refs as any).helptextPopupContainer) {
                    this.$nextTick(() => setTimeout(() => (this.$refs as any).helptextBtn.focus(), 20));
                }
                this.helptextActive = false;
            }
        });
    },
    methods: {
        onHelptextBtnClick() {
            this.helptextActive = !this.helptextActive;
            this.$nextTick(() => setTimeout(() => {
                const container = (this.$refs as any).helptextPopupContainer;
                if (container && container.focus) {
                    container.focus();
                }
            }, 20));
        },
        onHelpContainerClick(e: Event) {
            if ((e.target as HTMLAnchorElement)?.tagName.toLowerCase() !== 'a') {
                e.preventDefault();
                this.hideDialog();
            }
        },
        hideDialog() {
            this.helptextActive = false;
            this.$nextTick(() => (this.$refs as any).helptextBtn.focus());
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";
    @import "../../sr-only";

    .se-control {
        display: grid;
        grid-template-columns: auto auto auto 1fr auto;
        grid-template-rows: auto auto;
        width: 100%;
        border: 0;
        &.compact-content {
            .se-control-content-container {
                grid-column: ~"1/2";
            }
            .se-control-help-container {
                grid-column: ~"2/3";
            }
        }
        &.helpicon-inside {
            .se-control-content-container {
                grid-column: ~"1/6";
            }
        }
        &.horizontal {
            grid-template-rows: auto;
            .se-control-content-container {
                grid-column: ~"1/2";
                grid-row: ~"1/2";
            }
            .se-control-label-container {
                grid-column: ~"2/3";
            }
            .se-control-help-container {
                grid-column: ~"3/4";
                grid-row: ~"1/2";
            }
            .se-control-label {
                margin-left: 6px;
            }
            &.expand-content {
                grid-template-columns: 1fr auto auto;
            }
        }
        &.horizontal-reverse {
            grid-template-rows: auto;
            .se-control-content-container {
                grid-column: ~"2/3";
                grid-row: ~"1/2";
            }
            .se-control-help-container {
                grid-column: ~"3/4";
                grid-row: ~"1/2";
            }
            .se-control-label-container {
                margin-right: 8px;
            }
            &.expand-content {
                .se-control-content-container {
                    grid-column: ~"2/5";
                }
                .se-control-help-container {
                    grid-column: ~"5/6";
                }
                .helpicon {
                    margin-left: 7px;
                    margin-right: 0;
                }
                .helptext-popup {
                    right: -5px;
                    .helptext-arrow {
                        right: 8px;
                        left: auto;
                    }
                }
            }
        }
        &.horizontal, &.horizontal-reverse {
            .se-control-label {
                cursor: pointer;
            }
            .se-control-content-container {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
        legend {
            float: left;
        }
    }

    .se-control-label-container {
        display: flex;
        align-items: center;
        position: relative;
        grid-column: ~"1/2";
        grid-row: ~"1/2";
    }

    .se-control-content-container {
        grid-column: ~"1/5";
        grid-row: ~"2/3";
        display: flex;
        align-items: center;
        width: 100%;
    }

    .se-control-help-container {
        grid-column: ~"5/6";
        grid-row: ~"2/3";
        justify-self: center;
        align-self: center;
    }

    .se-control-label {
        margin: 4px 2px 4px 0;
    }

    .helpicon {
        margin: 4px;
        z-index: 98;
        width: 1.125rem;
        height: $width;
        background-color: @secontrol-helpicon-bg;
        color: @secontrol-helpicon-color;
        border: 1px solid @secontrol-helpicon-color;
        border-radius: 50%;
        font: inherit;
        font-size: 0.8125rem;
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
        z-index: 98;
    }

    .helptext-popup {
        position: absolute;
        box-shadow: 0 1px 10px @secontrol-helptext-shadow;
        width: 220px;
        right: 2px;
        &:not(.below) {
            bottom: 0;
            margin-bottom: 30px;
        }
        &.below {
            top: 0;
            margin-top: 3px;
        }
        &.middle {
            right: -100px;
            .helptext-arrow {
                right: auto;
                left: calc(50% - 10px);
            }
        }
        font-size: 0.75rem;
        font-weight: normal;
        text-align: left;
        z-index: 99;
        box-sizing: border-box;
        background-color: @secontrol-helptext-bg;
        color: @secontrol-helptext-color;

        .helptext-arrow {
            background-color: @secontrol-helptext-bg;
            width: 16px;
            height: $width;
            position: absolute;
            left: auto;
            right: 3px;
            &:not(.below) {
                bottom: -4px;
            }
            &.below {
                top: -4px;
            }
            transform: rotate(45deg);
            z-index: 97;
        }

        p {
            z-index: 100;
            position: relative;
            margin-bottom: 5px;
            &:last-child {
                margin-bottom: 0;
            }
        }

        .helptext-content-container {
            padding: 10px;
            padding-top: 10px;
        }

        .helptext-title {
            z-index: 99;
            margin: 3px 5px;
            font-size: 0.7rem;
            color: hsl(219, 20%, 77%);
            font-family: 'Trebuchet MS', 'Lucida Sans Unicode', Arial, sans-serif;
        }

        .close-btn-container {
            z-index: 99;
            background-color: @secontrol-helptext-bg;
            width: 100%;
            border-bottom: 1px solid darken(@secontrol-helptext-bg, 10%);
            text-align: right;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
        }

        .close-btn {
            z-index: 99;
            background-color: transparent;
            border: none;
            margin: 0;
            cursor: pointer;
            opacity: 0.7;
            img {
                display: block;
                margin: 3px 3px;
                width: 13px;
                height: $width;
            }
        }
    }
</style>
