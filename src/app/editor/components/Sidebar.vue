<template>
    <div class="sidebar-container">
        <h3 class="sr-only">
            Settings for chart and audio
        </h3>

        <SETablist
            class="sidebar-tablist"
            aria-label="Settings category"
        >
            <HeaderTab
                id="visualtab"
                small
                role="tab"
                :aria-selected="selectedSidebarTabId === 'Visual' ? 'true' : 'false'"
                :selected="selectedSidebarTabId === 'Visual'"
                aria-controls="chartMappingControls"
                :icon="visualIcon"
                @click="tabClicked('Visual')"
            >
                Visual
            </HeaderTab>
            <HeaderTab
                id="audiotab"
                small
                role="tab"
                :aria-selected="selectedSidebarTabId === 'Audio' ? 'true' : 'false'"
                :selected="selectedSidebarTabId === 'Audio'"
                aria-controls="audioMappingControls"
                :icon="audioIcon"
                @click="tabClicked('Audio')"
            >
                Audio
            </HeaderTab>
        </SETablist>

        <div id="sidebar-content">
            <div id="scroll-container">
                <ChartMappingControls
                    v-show="selectedSidebarTabId === 'Visual'"
                    id="chartMappingControls"
                    role="tabpanel"
                    aria-labelledby="visualtab"
                />
                <AudioMappingControls
                    v-show="selectedSidebarTabId === 'Audio'"
                    id="audioMappingControls"
                    role="tabpanel"
                    aria-labelledby="audiotab"
                />
            </div>
        </div>

        <div id="sidebar-bottom">
            <SEButton
                @click="onResetClick"
            >
                <img
                    alt=""
                    class="reset-icon"
                    :src="resetIcon"
                >
                Reset
            </SEButton>
        </div>
    </div>
</template>

<script lang="ts">
import HeaderTab from './HeaderTab.vue';
import SETablist from './basic/SETablist.vue';
import SEButton from './basic/SEButton.vue';
import AudioMappingControls from './mappings/AudioMappingControls.vue';
import ChartMappingControls from './mappings/ChartMappingControls.vue';
import visualIcon from '../assets/chart-line-solid.svg';
import audioIcon from '../assets/music-solid.svg';
import resetIcon from '../assets/undo-alt-solid.svg';
import { mapState } from 'vuex';

export default {
    components: {
        AudioMappingControls,
        ChartMappingControls,
        HeaderTab,
        SEButton,
        SETablist
    },
    data: function () {
        return {
            visualIcon, audioIcon, resetIcon
        };
    },
    computed: mapState('viewStore', ['selectedSidebarTabId']),
    methods: {
        tabClicked(tabId: string): void {
            this.$store.commit('viewStore/selectSidebarTab', tabId);
        },

        onResetClick(): void {
            if (window.confirm('This will reset all audio and visual settings. Proceed?')) {
                this.$store.commit('seriesParametersStore/clearState');
                this.$store.commit('chartParametersStore/restoreStoreState');
                this.$store.commit('globalSonifyParametersStore/restoreStoreState');
                this.$store.commit('viewStore/setLoadingChart', true);
                setTimeout(() => {
                    this.$store.commit('viewStore/setShowChartComponent', false);
                    this.$nextTick(() => {
                        // Recreate chart
                        this.$store.commit('viewStore/setShowChartComponent', true);
                        this.$nextTick(() => {
                            (this as any).$announcer.announce('New project loaded.');
                            setTimeout(() => this.$store.commit('viewStore/setLoadingChart', false), 900);
                        });
                    });
                }, 100);
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

    @tablist-height: 50px;
    @bottom-height: 45px;

    .sidebar-container {
        display: flex;
        flex-direction: column;
    }

    #sidebar-content {
        padding: 10px;
        flex: 1;
        max-height: calc(100% - @tablist-height - @bottom-height);
        box-sizing: border-box;
        background-color: @main-content-bg-color;
    }

    #scroll-container {
        height: 100%;
        box-sizing: border-box;
        overflow-y: auto;
        /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
        padding-left: 100px;
        margin-left: -100px;
    }

    #sidebar-bottom {
        background-color: @main-content-bg-color;
        box-sizing: border-box;
        height: @bottom-height;
        .se-button {
            margin-left: auto;
            margin-right: 10px;
            margin-bottom: 12px;
            &:hover {
                .reset-icon {
                    filter: invert();
                }
            }
        }
        .reset-icon {
            width: 12px;
            height: $width;
            margin-bottom: -1px;
            margin-right: 2px;
        }
    }

    .sidebar-tablist {
        height: @tablist-height;
        box-sizing: border-box;
        display: flex;
        padding: 0 0 3px;
    }

    .header-tab:first-child {
        border-radius: 4px 0px 0px 2px;
        &:not(.selected) {
            border-bottom-left-radius: 1px;
        }
    }
    .header-tab:last-child {
        border-radius: 0px 4px 2px 0px;
        &:not(.selected) {
            border-bottom-right-radius: 1px;
        }
    }

</style>
