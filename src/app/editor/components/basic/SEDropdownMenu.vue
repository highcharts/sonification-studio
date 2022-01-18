<!--
    A reusable dropdown menu. Provide options through props.

    Props:
        buttonText: The text for the menu button
        buttonIcon: The icon for the menu button
        options: Array of menu options objects, see format below
        [heading]: Optional heading for the menu

    Menu options object form:
        options = [{
            label: 'Unique label',
            icon: Icon object
            type: 'button'|'fileupload',
            fileTypes: '.txt,.csv' etc for file upload
            onclick: Function called on click for button items
            onload: Function called on file load for fileupload items
        }]
-->

<template>
    <div class="se-dropdownmenu">
        <SEButton
            ref="menuBtn"
            dark
            :aria-expanded="popupVisible"
            @click="popupVisible=!popupVisible"
        >
            <span>{{ buttonText }}</span>
            <img
                class="menu-icon"
                alt=""
                :src="buttonIcon"
            >
        </SEButton>

        <transition
            name="popup-slide"
            @enter="startSlide"
            @after-enter="endSlide"
            @before-leave="startSlide"
            @after-leave="endSlide"
        >
            <div
                v-show="popupVisible"
                class="se-dropdownmenu-popup"
            >
                <div class="popup-content">
                    <p
                        v-if="heading"
                        class="heading"
                    >
                        {{ heading }}
                    </p>
                    {{/* Webkit doesn't think this is a real list, so we override heuristics with ARIA */}}
                    <ul role="list">
                        <li
                            v-for="opt in options"
                            :key="opt.label"
                        >
                            <button
                                v-if="opt.type === 'button'"
                                @click="opt.onclick"
                                @keydown.enter="opt.onclick"
                            >
                                <img
                                    alt=""
                                    :src="opt.icon"
                                >
                                {{ opt.label }}
                            </button>
                            <SEFileUploadButton
                                v-if="opt.type === 'fileupload'"
                                :file-types="opt.fileTypes"
                                @load="opt.onload"
                            >
                                <img
                                    alt=""
                                    :src="opt.icon"
                                >
                                {{ opt.label }}
                            </SEFileUploadButton>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { keyPressed, Keys, Modifiers } from '../../core/utils/keyboardUtils';
import SEButton from './SEButton.vue';
import SEFileUploadButton from './SEFileUploadButton.vue';

export default {
    components: {
        SEButton,
        SEFileUploadButton
    },
    props: {
        buttonText: { type: String, required: true },
        buttonIcon: { type: String, required: true },
        options: { type: Array, required: true },
        heading: { type: String, default: '' },
        fileTypes: { type: String, default: '.txt,.csv' }
    },
    data() {
        return {
            popupVisible: false
        };
    },
    mounted() {
        document.addEventListener('click', (e: MouseEvent) => {
            if (!this.$el.contains(e.target as any)) {
                this.popupVisible = false;
            }
        });
        document.addEventListener('keydown', e => {
            if (keyPressed(Keys.Esc, Modifiers.None, e) && this.popupVisible) {
                this.popupVisible = false;
                if (this.$el.contains(e.target as HTMLElement)) {
                    this.$nextTick(() => setTimeout(() => (this as any).$refs.menuBtn.$el.focus(), 20));
                }
            }
        });
    },
    methods: {
        startSlide(el: HTMLElement) {
            el.style.height = el.scrollHeight + 'px';
        },

        endSlide(el: HTMLElement) {
            el.style.height = '';
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .se-dropdownmenu {
        z-index: 99;
        position: relative;
    }

    .se-button {
        display: flex;
        align-items: center;
        margin-top: 4px;
        margin-bottom: 6px;
        .menu-icon {
            width: 10px;
            height: 10px;
            margin-left: 5px;
            filter: invert();
        }
        &:hover, &:active {
            .menu-icon {
                filter: none;
            }
        }
    }

    .popup-slide-enter, .popup-slide-leave-to {
        opacity: 0;
        height: 0 !important;
    }

    .popup-slide-enter-active, .popup-slide-leave-active {
        will-change: height;
        transition: all 0.25s ease;
    }

    .se-dropdownmenu-popup {
        min-width: 13.5rem;
        box-sizing: border-box;
        overflow: hidden;
        position: absolute;
        top: 36px;
        right: 5px;
        background-color: @popup-menu-bg;
        border: 1px solid @popup-menu-border;
        box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.2);
        border-radius: 3px;
    }

    .popup-content {
        padding: 15px 25px;
        .heading {
            text-align: center;
            margin-bottom: 10px;
            font-size: 0.9rem;
        }
        li {
            list-style-type: none;
            padding: 0;
            margin: 4px 0;
        }
        label, button {
            border-radius: 0;
            width: 100%;
            padding: 6px 15px;
            font: inherit;
            text-align: center;
            box-sizing: border-box;
            margin: 5px 0;
            font-size: 0.8125rem;
            font-weight: bold;
            cursor: pointer;
            display: block;
            background-color: @sebutton-bg;
            color: @sebutton-color;
            border: 1px solid @sebutton-color;
            &:hover {
                background-color: @sebutton-hover-bg;
                color: @sebutton-hover-color;
            }
            &:active {
                background-color: darken(@sebutton-hover-bg, 5%);
                color: darken(@sebutton-hover-color, 5%);
            }
            &:active, &:hover {
                img {
                    filter: invert();
                }
            }
            img {
                width: 14px;
                height: 14px;
                margin-right: 4px;
                vertical-align: middle;
            }
        }
    }
</style>
