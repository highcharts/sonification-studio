<template>
    <div
        role="group"
        aria-label="Save project"
        class="export-container"
    >
        <SEButton
            dark
            @click="popupVisible=!popupVisible"
        >
            Save project
            <img
                class="menu-icon"
                alt=""
                :src="menuIcon"
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
                class="export-popup"
            >
                <div class="export-popup-content">
                    <p>Download project as</p>
                    <ul>
                        <li><button>Video</button></li>
                        <li><button>Sound</button></li>
                        <li><button>SVG Image</button></li>
                        <li><button>PNG Image</button></li>
                        <li><button>CSV Data</button></li>
                        <li><button>Highcharts JS Config</button></li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import menuIcon from '../assets/bars-solid.svg';
import SEButton from './basic/SEButton.vue';

export default {
    components: {
        SEButton
    },
    data() {
        return { menuIcon, popupVisible: false };
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
    @import "../colors";

    .export-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        position: relative;
        z-index: 10;
    }

    .se-button {
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

    .export-popup {
        box-sizing: border-box;
        overflow: hidden;
        position: absolute;
        top: 35px;
        right: 5px;
        background-color: @export-dialog-bg;
        border: 1px solid @export-dialog-border;
        box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.2);
        border-radius: 3px;
    }

    .export-popup-content {
        padding: 15px 25px;
        p {
            text-align: center;
            margin-bottom: 10px;
        }
        li {
            list-style-type: none;
            padding: 0;
            margin: 4px 0;
        }
        button {
            width: 100%;
            padding: 6px 15px;
            font: inherit;
            font-size: 12px;
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
        }
    }
</style>
