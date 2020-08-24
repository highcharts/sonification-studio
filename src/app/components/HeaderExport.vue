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
                        <li>
                            <button
                                @click="dlVideo"
                                @keydown.enter="dlVideo"
                            >
                                <img
                                    alt=""
                                    :src="videoIcon"
                                >
                                Video
                            </button>
                        </li>
                        <li>
                            <button
                                @click="dlAudio"
                                @keydown.enter="dlAudio"
                            >
                                <img
                                    alt=""
                                    :src="musicIcon"
                                >
                                Audio only
                            </button>
                        </li>
                        <li>
                            <button
                                @click="dlSVG"
                                @keydown.enter="dlSVG"
                            >
                                <img
                                    alt=""
                                    :src="pictureIcon"
                                >
                                SVG Image
                            </button>
                        </li><li>
                            <button
                                @click="dlPNG"
                                @keydown.enter="dlPNG"
                            >
                                <img
                                    alt=""
                                    :src="pictureIcon"
                                >
                                PNG Image
                            </button>
                        </li><li>
                            <button
                                @click="dlCSV"
                                @keydown.enter="dlCSV"
                            >
                                <img
                                    alt=""
                                    :src="csvIcon"
                                >
                                CSV Data
                            </button>
                        </li><li>
                            <button
                                @click="dlChartConfig"
                                @keydown.enter="dlChartConfig"
                            >
                                <img
                                    alt=""
                                    :src="jsIcon"
                                >
                                Highcharts JS Config
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import menuIcon from '../assets/bars-solid.svg';
import jsIcon from '../assets/js-square-brands.svg';
import pictureIcon from '../assets/image-regular.svg';
import videoIcon from '../assets/film-solid.svg';
import musicIcon from '../assets/music-solid.svg';
import csvIcon from '../assets/file-csv-solid.svg';
import SEButton from './basic/SEButton.vue';

export default {
    components: {
        SEButton
    },
    data() {
        return {
            menuIcon,
            jsIcon,
            pictureIcon,
            videoIcon,
            musicIcon,
            csvIcon,
            popupVisible: false
        };
    },
    mounted() {
        document.addEventListener('click', (e: MouseEvent) => {
            if (!this.$el.contains(e.target as any)) {
                this.popupVisible = false;
            }
        });
    },
    methods: {
        startSlide(el: HTMLElement) {
            el.style.height = el.scrollHeight + 'px';
        },
        endSlide(el: HTMLElement) {
            el.style.height = '';
        },
        dlVideo() {
            console.log('Video download to be implemented.');
        },
        dlAudio() {
            console.log('Audio download to be implemented.');
        },
        dlSVG() {
            console.log('SVG download to be implemented.');
        },
        dlPNG() {
            console.log('PNG download to be implemented.');
        },
        dlCSV() {
            console.log('CSV download to be implemented.');
        },
        dlChartConfig() {
            console.log('Highcharts config download to be implemented.');
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
            font-size: 13px;
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
