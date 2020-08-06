<template>
    <main>
        <div id="mainGrid">
            <Data
                v-show="selectedHeaderTabContent === 'dataContent'"
                id="dataContent"
                class="fullscreen"
            />

            <Sidebar
                v-show="selectedHeaderTabContent !== 'dataContent'"
                id="sidebar"
                class="sidebar"
            />

            <PlayControls
                v-show="selectedHeaderTabContent !== 'dataContent'"
                class="play-controls"
            />

            <Preview
                v-show="selectedHeaderTabContent !== 'dataContent'"
                class="preview"
            />

            <TextDescription
                v-show="selectedHeaderTabContent !== 'dataContent'"
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
    computed: mapState('viewStore', ['selectedHeaderTabContent'])
};
</script>

<style lang="less" scoped>
    #mainGrid {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-rows: auto 1.8fr 1fr;
        grid-template-columns: 350px 1fr;
        grid-gap: 5px;
    }

    .fullscreen {
        grid-column-start: 1;
        grid-column-end: 3;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .sidebar {
        grid-column-start: 1;
        grid-row-start: 2;
        grid-row-end: 4;
    }

    .play-controls {
        grid-column-start: 1;
        grid-column-end: 3;
    }

    .preview {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 2;
        grid-row-end: 3;
    }

    .description {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 3;
    }
</style>
