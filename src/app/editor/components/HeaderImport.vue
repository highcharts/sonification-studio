<template>
    <div class="import-container">
        <SEButton
            ref="popupBtn"
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
                    {{/* Webkit doesn't think this is a real list, so we override heuristics with ARIA */}}
                    <ul role="list">
                        <li>
                            <button
                                @click="newProject"
                            >
                                <img
                                    alt=""
                                    :src="projectIcon"
                                    class="icon"
                                >
                                New Project
                            </button>
                        </li>
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
                                Open Project File
                            </SEFileUploadButton>
                        </li>
                        <li>
                            <SEFileUploadButton @load="importCSV">
                                <img
                                    alt=""
                                    :src="csvIcon"
                                    class="icon"
                                >
                                Import CSV Data
                            </SEFileUploadButton>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { keyPressed, Keys, Modifiers } from '../core/utils/keyboardUtils';
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
            if (keyPressed(Keys.Esc, Modifiers.None, e) && this.popupVisible) {
                this.popupVisible = false;
                if (this.$el.contains(e.target as HTMLElement)) {
                    this.$nextTick(() => setTimeout(() => (this as any).$refs.popupBtn.$el.focus(), 20));
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
        },
        cleanSlateAndRecreateChart(afterRecreate: Function) {
            this.$store.commit('seriesParametersStore/clearState');
            // Remove chart from DOM because chart.update does not remove series options
            // - even with one-to-one parameter set.
            this.$store.commit('viewStore/setLoadingChart', true);
            setTimeout(() => {
                this.$store.commit('viewStore/setShowChartComponent', false);
                this.$nextTick(() => {
                    // Recreate chart
                    this.$store.commit('viewStore/setShowChartComponent', true);
                    this.$nextTick(() => {
                        try {
                            afterRecreate();
                        } finally {
                            setTimeout(() => this.$store.commit('viewStore/setLoadingChart', false), 1200);
                        }
                    });
                });
            }, 100);
        },
        importProject(fileContents: string) {
            if (fileContents) {
                this.cleanSlateAndRecreateChart(() => {
                    // After chart has been deleted and recreated, load in new options
                    try {
                        restoreFromProjectFile(fileContents, this.$store);
                        (this as any).$announcer.announce('Project loaded.');
                    } catch (e) {
                        (this as any).$announcer.announce('Error loading project.');
                        console.error('Error loading project:', e);
                    }
                });
            }
        },
        newProject() {
            if(window.confirm('This will clear all data and reset all settings. Proceed?')) {
                this.cleanSlateAndRecreateChart(() => {
                    // Restore state with no argument restores defaults.
                    this.$store.dispatch('restoreState');
                    (this as any).$announcer.announce('New project loaded.');
                });
            }
        },
        importCSV(fileContents: string) {
            if (fileContents) {
                this.$store.dispatch('dataStore/loadFromCSV', fileContents);
                (this as any).$announcer.announce('Data loaded.');
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
        z-index: 99;
        min-width: 6.063rem;
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
        min-width: 12.5rem;
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
