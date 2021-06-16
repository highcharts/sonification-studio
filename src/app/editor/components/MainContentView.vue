<template>
    <main>
        <Data
            v-show="selectedHeaderTabContent === 'dataContent'"
            id="dataContent"
            role="tabpanel"
        />

        <div
            v-show="selectedHeaderTabContent !== 'dataContent'"
            id="chartContent"
            role="tabpanel"
            aria-label="Chart and sonification"
        >
            <PlayControls class="play-controls" />

            <Preview
                v-if="showChartComponent"
                class="preview"
            />

            <Sidebar
                id="sidebar"
                class="sidebar"
            />

            <TextDescription
                class="description"
            />
        </div>
    </main>
</template>

<script lang="ts">
import TextDescription from './TextDescription.vue';
import PlayControls from './PlayControls.vue';
import Preview from './Preview.vue';
import Data from './Data.vue';
import Sidebar from './Sidebar.vue';
import { mapState } from 'vuex';

export default {
    components: {
        TextDescription,
        PlayControls,
        Preview,
        Data,
        Sidebar
    },
    computed: mapState('viewStore', ['selectedHeaderTabContent', 'showChartComponent'])
};
</script>

<style lang="less" scoped>
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
        grid-template-rows: auto 1.8fr 1fr;
        grid-template-columns: 1fr 350px;
        grid-gap: 5px;
    }

    .sidebar {
        grid-column-start: 2;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .play-controls {
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
