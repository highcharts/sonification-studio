<template>
    <main>
        <Data
            v-show="selectedHeaderTabContent === 'dataContent'"
            id="dataContent"
            ref="dataContent"
            role="tabpanel"
            tabindex="-1"
        />

        <div
            v-show="selectedHeaderTabContent !== 'dataContent'"
            id="chartContent"
            ref="chartContent"
            :class="{ 'full-width': !sidebarVisible }"
            role="tabpanel"
            tabindex="-1"
            aria-labelledby="chart-tab-heading"
        >
            <h2
                id="chart-tab-heading"
                class="sr-only"
            >
                Chart and sonification
            </h2>

            <PlayControls class="play-controls" />

            <Preview
                v-if="showChartComponent"
                class="preview"
            />

            <Sidebar
                v-show="sidebarVisible"
                ref="sidebar"
                class="sidebar"
            />

            <ShowPanel
                v-show="!sidebarVisible"
                name="sidebar"
                arrow-direction="left"
                @click="onShowSidebar"
            />

            <TextDescription class="description" />
        </div>
    </main>
</template>

<script lang="ts">
import TextDescription from './TextDescription.vue';
import PlayControls from './PlayControls.vue';
import Preview from './Preview.vue';
import Data from './Data.vue';
import Sidebar from './Sidebar.vue';
import ShowPanel from './ShowPanel.vue';
import { mapState } from 'vuex';

export default {
    components: {
        TextDescription,
        PlayControls,
        Preview,
        Data,
        Sidebar,
        ShowPanel
    },
    computed: mapState('viewStore', ['selectedHeaderTabContent', 'showChartComponent', 'sidebarVisible']),
    methods: {
        skipToContent() {
            if (this.selectedHeaderTabContent === 'dataContent') {
                ((this.$refs.dataContent as Vue).$el as HTMLElement).focus();
            } else {
                (this.$refs.chartContent as HTMLDivElement).focus();
            }
        },

        onShowSidebar() {
            this.$store.commit('viewStore/setSidebarVisible', true);
            (this as any).$chartBridge.reflowChart();
            (this as any).$refs.sidebar.focusHideButton();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../sr-only";

    main {
        padding-left: 10px;
        padding-right: 10px;
    }

    #dataContent {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }

    #chartContent {
        box-sizing: border-box;
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-rows: auto 1fr auto;
        grid-template-columns: 1fr 350px;
        grid-column-gap: 5px;
        &.full-width {
            grid-template-columns: 1fr 5px;
        }
    }

    .sidebar, .show-panel {
        grid-column-start: 2;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .play-controls {
        padding: 10px 10px 0 10px;
        grid-column-start: 1;
        grid-column-end: 2;
    }

    .preview {
        grid-column-start: 1;
        grid-column-end: 2;
        grid-row-start: 2;
        grid-row-end: 3;
    }

    .description {
        grid-column-start: 1;
        grid-column-end: 2;
        grid-row-start: 3;
    }
</style>
