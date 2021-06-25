<template>
    <section :aria-labelledby="uuid">
        <h3
            :id="uuid"
            class="sr-only"
        >
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
    </section>
</template>

<script lang="ts">
import HeaderTab from './HeaderTab.vue';
import SETablist from './basic/SETablist.vue';
import AudioMappingControls from './mappings/AudioMappingControls.vue';
import ChartMappingControls from './mappings/ChartMappingControls.vue';
import visualIcon from '../assets/chart-line-solid.svg';
import audioIcon from '../assets/music-solid.svg';
import { mapState } from 'vuex';
import { getUUID } from '../core/utils/objects';

export default {
    components: {
        AudioMappingControls,
        ChartMappingControls,
        HeaderTab,
        SETablist
    },
    data: function () {
        return {
            visualIcon, audioIcon
        };
    },
    computed: {
        ...mapState('viewStore', ['selectedSidebarTabId']),
        uuid: () => getUUID('se-sidebar')
    },
    methods: {
        tabClicked: function (tabId: string): void {
            this.$store.commit('viewStore/selectSidebarTab', tabId);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

    @tablist-height: 50px;

    section {
        display: flex;
        flex-direction: column;
    }

    #sidebar-content {
        padding: 10px;
        flex: 1;
        max-height: calc(100% - @tablist-height);
        box-sizing: border-box;
        background-color: @main-content-bg-color;
    }

    #scroll-container {
        height: 100%;
        overflow-y: auto;
        /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
        padding-left: 100px;
        margin-left: -100px;
    }

    .sidebar-tablist {
        height: @tablist-height;
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
