<template>
    <div
        role="group"
        aria-label="Save project"
        class="export-container"
    >
        <SEButton
            dark
            :aria-expanded="popupVisible"
            @click="popupVisible=!popupVisible"
        >
            Save project
            <img
                class="menu-icon"
                alt=""
                :src="menuIcon"
            >
        </SEButton>

        <transition name="fade-in">
            <SEModalMessage v-show="rendering">
                <img
                    alt=""
                    class="spinnerIcon"
                    :src="spinnerIcon"
                >
                <span class="render-message">Rendering</span>
            </SEModalMessage>
        </transition>

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
                                @click="dlPNG"
                                @keydown.enter="dlPNG"
                            >
                                <img
                                    alt=""
                                    :src="pictureIcon"
                                >
                                Image
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
                                Vector Image
                            </button>
                        </li>
                        <li>
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
                        </li>
                        <li>
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
import { downloadURI } from '../core/utils/browserUtils';
import menuIcon from '../assets/bars-solid.svg';
import jsIcon from '../assets/js-square-brands.svg';
import pictureIcon from '../assets/image-regular.svg';
import videoIcon from '../assets/film-solid.svg';
import musicIcon from '../assets/music-solid.svg';
import csvIcon from '../assets/file-csv-solid.svg';
import spinnerIcon from '../assets/spinner-solid.svg';
import SEButton from './basic/SEButton.vue';
import SEModalMessage from './basic/SEModalMessage.vue';

export default {
    components: {
        SEButton,
        SEModalMessage
    },
    data() {
        return {
            menuIcon,
            jsIcon,
            pictureIcon,
            videoIcon,
            musicIcon,
            csvIcon,
            spinnerIcon,
            popupVisible: false,
            rendering: false
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
            this.rendering = true;
            (this as any).$chartBridge.downloadVideo(24).then(() => {
                this.rendering = false;
            }).catch((e: unknown) => {
                this.rendering = false;
                throw e;
            });
        },
        dlAudio() {
            this.rendering = true;
            try {
                (this as any).$chartBridge.downloadAudio(() => {
                    this.rendering = false;
                });
            } catch (e) {
                this.rendering = false;
                throw e;
            }
        },
        dlSVG() {
            (this as any).$chartBridge.downloadSVG();
        },
        dlPNG() {
            (this as any).$chartBridge.downloadPNG();
        },
        dlCSV() {
            downloadURI(
                this.$store.getters['dataStore/tableCSVDataURI'],
                (this as any).$chartBridge.getChartTitleForExport() + '.csv'
            );
        },
        dlChartConfig() {
            (this as any).$chartBridge.downloadChartConfig();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .export-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        position: relative;
        z-index: 10;
        min-width: 140px;
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

    .render-message {
        display: block;
    }

    .spinnerIcon {
        width: 32px;
        height: 32px;
        display: block;
        margin: 0 auto 10px;
        animation-name: spin;
        animation-duration: 2000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }

    @keyframes spin {
        from {
            filter: hue-rotate(0deg);
            opacity: 1;
            transform: rotate(0deg);
        }
        50% {
            opacity: 0.3
        }
        to {
            filter: hue-rotate(360deg);
            opacity: 1;
            transform: rotate(360deg);
        }
    }

    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }

    .fade-in-enter-active, .fade-in-leave-active {
        transition: all 0.25s ease;
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
        min-width: 200px;
        box-sizing: border-box;
        overflow: hidden;
        position: absolute;
        top: 36px;
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
