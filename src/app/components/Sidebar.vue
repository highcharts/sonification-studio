<template>
    <section aria-label="Settings for chart and audio">
        <div
            class="sidebar-tablist"
            role="tablist"
            aria-label="Settings category"
        >
            <HeaderTab
                small
                role="tab"
                :aria-selected="selectedSidebarTabId === 'Visual'"
                :selected="selectedSidebarTabId === 'Visual'"
                aria-controls="chartMappingControls"
                :icon="visualIcon"
                @click="tabClicked('Visual')"
            >
                Visual
            </HeaderTab>
            <HeaderTab
                small
                role="tab"
                :aria-selected="selectedSidebarTabId === 'Audio'"
                :selected="selectedSidebarTabId === 'Audio'"
                aria-controls="audioMappingControls"
                :icon="audioIcon"
                @click="tabClicked('Audio')"
            >
                Audio
            </HeaderTab>
        </div>
        <div id="sidebar-content">
            <div id="scroll-container">
                <ChartMappingControls
                    v-show="selectedSidebarTabId === 'Visual'"
                    id="chartMappingControls"
                />
                <AudioMappingControls
                    v-show="selectedSidebarTabId === 'Audio'"
                    id="audioMappingControls"
                />
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import HeaderTab from './HeaderTab.vue';
import AudioMappingControls from './mappings/AudioMappingControls.vue';
import ChartMappingControls from './mappings/ChartMappingControls.vue';
import visualIcon from '../assets/chart-line-solid.svg';
import audioIcon from '../assets/music-solid.svg';
import { mapState } from 'vuex';

export default {
    components: {
        AudioMappingControls,
        ChartMappingControls,
        HeaderTab
    },
    data: function () {
        return {
            visualIcon, audioIcon
        };
    },
    computed: mapState('viewStore', ['selectedSidebarTabId']),
    methods: {
        tabClicked: function (tabId: string): void {
            this.$store.commit('viewStore/selectSidebarTab', tabId);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        display: flex;
        flex-direction: column;
    }

    #sidebar-content {
        padding: 10px;
        flex: 1;
        max-height: calc(100% - 30px); /* Sidebar height minus tablist */
        box-sizing: border-box;
        background-color: @main-content-bg-color;
    }

    #scroll-container {
        height: 100%;
        overflow-y: scroll;
        /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
        padding-left: 100px;
        margin-left: -100px;
    }

    .sidebar-tablist {
        height: 30px;
        box-sizing: border-box;
        display: flex;
        padding: 0 0 3px;
    }

    .header-tab:first-child {
        border-radius: 4px 0px 0px 2px;
    }

    .header-tab:last-child {
        border-radius: 0px 4px 2px 0px;
    }

</style>
