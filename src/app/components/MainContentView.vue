<template>
    <main>
        <div id="mainGrid">
            <Data
                v-show="selectedView === 'dataContent'"
                id="dataContent"
                class="fullscreen"
            />

            <MappingControls
                v-show="selectedView === 'mappingsContent'"
                id="mappingsContent"
                class="sidebar"
            />

            <section
                v-show="selectedView === 'chartContent'"
                id="chartContent"
                class="sidebar"
            >
                Chart controls
            </section>

            <Preview
                v-if="selectedView !== 'dataContent'"
                class="preview"
            />

            <TextDescription
                v-show="selectedView !== 'dataContent'"
                class="description"
            />
        </div>
    </main>
</template>

<script lang="ts">
import TextDescription from './TextDescription.vue';
import Preview from './Preview.vue';
import Data from './Data.vue';
import MappingControls from './MappingControls.vue';

export default {
    components: {
        TextDescription,
        Preview,
        Data,
        MappingControls
    },
    props: {
        selectedView: { type: String, required: true }
    }
};
</script>

<style lang="less" scoped>
    #mainGrid {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-rows: 1.8fr 1fr;
        grid-template-columns: 350px 1fr;
        grid-gap: 5px;
    }

    .fullscreen {
        grid-column-start: 1;
        grid-column-end: 3;
        grid-row-start: 1;
        grid-row-end: 3;
    }

    .sidebar {
        grid-column-start: 1;
        grid-row-start: 1;
        grid-row-end: 3;
    }

    .preview {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 1;
        grid-row-end: 2;
    }

    .description {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 2;
    }
</style>
