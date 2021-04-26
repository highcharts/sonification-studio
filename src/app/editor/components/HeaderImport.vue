<template>
    <div class="import-container">
        <SEButton
            dark
            :aria-expanded="popupVisible"
            @click="popupVisible=!popupVisible"
        >
            Open
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
                class="import-popup"
            >
                <div class="import-popup-content">
                    <p>Load data</p>
                    <ul>
                        <li>
                            <SEFileUploadButton
                                :file-types="'.hssp'"
                                @load="importProject"
                            >
                                <img
                                    alt=""
                                    :src="projectIcon"
                                    class="icon"
                                >
                                Open project file
                            </SEFileUploadButton>
                        </li>
                        <li>
                            <SEFileUploadButton @load="importCSV">
                                <img
                                    alt=""
                                    :src="csvIcon"
                                    class="icon"
                                >
                                Import CSV data
                            </SEFileUploadButton>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { restoreFromProjectFile } from '../core/utils/projectFileHandling';
import SEFileUploadButton from './basic/SEFileUploadButton.vue';
import menuIcon from '../assets/bars-solid.svg';
import projectIcon from '../assets/file-export-solid.svg';
import csvIcon from '../assets/file-csv-solid.svg';
import SEButton from './basic/SEButton.vue';

export default {
    components: {
        SEButton,
        SEFileUploadButton
    },
    data() {
        return {
            menuIcon,
            projectIcon,
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
        document.addEventListener('keydown', e => {
            const keyCode = e.which || e.keyCode;
            if (keyCode === 27 && this.popupVisible) { // esc
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
        importProject(fileContents: string) {
            if (fileContents) {
                try {
                    restoreFromProjectFile(fileContents, this.$store);
                    this.$announcer.announce('Project loaded.');
                } catch (e) {
                    this.$announcer.announce('Error loading project.');
                    console.error('Error loading project:', e);
                }
            }
        },
        importCSV(fileContents: string) {
            if (fileContents) {
                this.$store.dispatch('dataStore/loadFromCSV', fileContents);
                this.$announcer.announce('Data loaded.');
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .import-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        position: relative;
        z-index: 10;
        min-width: 97px;
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

    .import-popup {
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

    .import-popup-content {
        padding: 15px 15px;
        p {
            text-align: center;
            margin-bottom: 10px;
        }
        ul {
            padding-left: 0;
        }
        li {
            list-style-type: none;
            padding: 0;
            margin: 4px 0;
        }
        label {
            width: 100%;
            padding: 6px 15px;
            font: inherit;
            text-align: center;
            box-sizing: border-box;
            margin: 5px 0;
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
                .icon {
                    filter: invert();
                }
            }
            .icon {
                width: 14px;
                height: 14px;
                margin-right: 4px;
                vertical-align: middle;
            }
        }
    }
</style>
