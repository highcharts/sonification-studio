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
        - [helptextBelow]: Boolean - Show helptext popup below instead of above.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
        - [horizontalReverse]: Boolean - Show label to the left of control, rather than above.
        - [expandContent]: Boolean - Expand the control content to fill empty space.
        - [isFieldset]: Boolean - Code the control as a fieldset.
        - [fieldsetLegend]: String - Legend to add to fieldset.
-->
<template>
    <component
        :is="isFieldset ? 'fieldset' : 'div'"
        class="se-control"
        :class="{ horizontal: horizontal, 'horizontal-reverse': horizontalReverse, 'expand-content': expandContent }"
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
        <div class="se-control-content-container">
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
                :aria-label="'Help for ' + (label || fieldsetLegend)"
                :aria-expanded="helptextActive ? 'true' : 'false'"
                @click="onHelptextBtnClick"
            >
                ?
            </button>

            <div
                v-show="helptextActive"
                ref="helptextPopupContainer"
                class="helptext-popup-container"
                tabindex="-1"
                @keydown.enter="onHelpContainerClick"
                @keydown.space="onHelpContainerClick"
                @click="onHelpContainerClick"
            >
                <div
                    class="helptext-popup"
                    :class="{ below: helptextBelow }"
                >
                    <div>
                        <p
                            v-for="helptextParagraph in helptextParagraphs"
                            :key="helptextParagraph.index"
                        >
                            {{ helptextParagraph.content }}
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
import { getUUID, GenericObject } from '../../core/utils/objects';
import { Keys, keyPressed, Modifiers } from '../../core/utils/keyboardUtils';

export default {
    props: {
        label: { type: String, default: '' },
        helptext: { type: String, default: '' },
        horizontal: { type: Boolean, default: false },
        helptextBelow: { type: Boolean, default: false },
        horizontalReverse: { type: Boolean, default: false },
        expandContent: { type: Boolean, default: false },
        isFieldset: { type: Boolean, default: false },
        fieldsetLegend: { type: String, default: '' }
    },
    data() {
        return {
            helptextActive: false
        };
    },
    computed: {
        labelUUID: () => getUUID('se-ctl-label'),
        controlUUID: () => getUUID('se-ctl-content'),
        helptextParagraphs: function(): GenericObject[] {
            const arr = this.helptext ? this.helptext.split('<br>') : [];
            return arr.map((x, i) => ({ index: i, content: x }));
        }
    },
    mounted() {
        document.addEventListener('click', (e: MouseEvent) => {
            if (this.helptextActive && !this.$el.contains(e.target as any)) {
                this.helptextActive = false;
            }
        });
        document.addEventListener('keyup', (e: KeyboardEvent) => {
            if (this.helptextActive && keyPressed(Keys.Esc, Modifiers.None, e)) {
                e.preventDefault();
                if (e.target === (this.$refs as any).helptextPopupContainer) {
                    this.$nextTick(() => (this.$refs as any).helptextBtn.focus());
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
            }, 10));
        },
        onHelpContainerClick(e: Event) {
            e.preventDefault();
            this.helptextActive = false;
            this.$nextTick(() => (this.$refs as any).helptextBtn.focus());
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .se-control {
        display: grid;
        grid-template-columns: auto auto auto 1fr auto;
        grid-template-rows: auto auto;
        width: 100%;
        border: 0;
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
        grid-column: ~"1/6";
        grid-row: ~"2/3";
    }

    .se-control-help-container {
        grid-column: ~"2/3";
        grid-row: ~"1/2";
        justify-self: center;
        align-self: center;
    }

    .se-control-label {
        margin: 4px 2px 4px 0;
    }

    .helpicon {
        margin: 2px 4px 4px;
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
    }

    .helptext-popup {
        cursor: pointer;
        position: absolute;
        box-shadow: 0 1px 10px @secontrol-helptext-shadow;
        width: 200px;
        right: -90px;
        &:not(.below) {
            bottom: 0;
            margin-bottom: 30px;
        }
        &.below {
            top: 0;
            margin-top: 3px;
        }
        font-size: 0.75rem;
        font-weight: normal;
        text-align: left;
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
            left: calc(50% - 10px);
            right: auto;
            &:not(.below) {
                bottom: -4px;
            }
            &.below {
                top: -4px;
            }
            transform: rotate(45deg);
            z-index: 98;
        }
        p {
            z-index: 100;
            position: relative;
            margin-bottom: 5px;
            &:last-child {
                margin-bottom: 0;
            }
        }
    }

</style>
