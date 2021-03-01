<!--
    A collapsible accordion heading/content pair.
    Provide content in default slot.

    Props:
        - heading: String - Heading text.
        - [selected]: Boolean - Preselect item, render as expanded.
-->
<template>
    <div class="se-accordion-item">
        <button
            :class="{ selected: isSelected }"
            :aria-expanded="isSelected ? 'true' : 'false'"
            @click="onclick"
        >
            <h3>{{ heading }}</h3>
            <div
                class="select-icon"
                :class="{ selected: isSelected }"
            />
        </button>

        <transition
            name="fold"
            @enter="startFold"
            @after-enter="endFold"
            @before-leave="startFold"
            @after-leave="endFold"
        >
            <div v-show="isSelected">
                <div class="se-accordion-item-content">
                    <slot />
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        heading: { type: String, required: true },
        selected: { type: Boolean, default: false }
    },
    data() {
        return {
            isSelected: false
        };
    },
    created() {
        this.isSelected = this.selected;
    },
    methods: {
        startFold(el: HTMLElement) {
            el.style.height = el.scrollHeight + 'px';
        },
        endFold(el: HTMLElement) {
            el.style.height = '';
        },
        onclick(e: Event) {
            this.isSelected = !this.isSelected;
            this.$emit('click', e, this, this.isSelected);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    button {
        position: relative;
        margin: 0;
        padding: 10px;
        width: 100%;
        background-color: @seaccordionitem-bg;
        color: @seaccordionitem-color;
        border: none;
        font: inherit;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        text-align: left;
        display: block;
        &:hover, &:focus {
            background-color: @seaccordionitem-hover-bg;
            color: @seaccordionitem-hover-color;
            .select-icon {
                border-color: @seaccordionitem-arrow-hover-color;
            }
        }
    }

    button::-moz-focus-inner {
        border: 0;
    }

    .se-accordion-item-content {
        padding: 10px;
        box-sizing: border-box;
    }

    .select-icon {
        width: 8px;
        height: 8px;
        position: absolute;
        top: 0;
        right: 1.25rem;
        bottom: 0;
        margin: auto;
        border-right: 2px solid;
        border-bottom: 2px solid;
        border-color: @seaccordionitem-arrow-color;
        transform: translateY(-2px) rotate(45deg);
        transition: transform 0.2s ease;
        &.selected {
            transform: translateY(2px) rotate(225deg);
        }
    }

    .fold-enter-active, .fold-leave-active {
        will-change: height;
        transition: height 0.2s ease;
        overflow: hidden;
    }
    .fold-enter, .fold-leave-to {
        height: 0 !important;
    }

</style>
