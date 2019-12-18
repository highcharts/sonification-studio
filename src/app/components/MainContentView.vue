<template>
    <main>
        <section
            v-show="selectedView === 'dataContent'"
            id="dataContent"
            class="fullscreen"
        >
            Data input
        </section>

        <section
            v-show="selectedView === 'mappingsContent'"
            id="mappingsContent"
            class="sidebar"
        >
            Mapping controls
        </section>

        <section
            v-show="selectedView === 'customizeContent'"
            id="customizeContent"
            class="sidebar"
        >
            Customize controls
        </section>

        <section
            v-show="selectedView !== 'dataContent'"
            class="preview"
        >
            Preview
        </section>

        <section
            v-show="selectedView !== 'dataContent'"
            class="description"
        >
            Text description
        </section>
    </main>
</template>

<script lang="ts">
export default {
    props: {
        selectedView: { type: String, required: true }
    }
};
</script>

<style lang="less" scoped>
    main {
        display: grid;
        grid-template-rows: 3fr 1fr;
        grid-template-columns: 350px 1fr;
        grid-gap: 5px;
    }

    section {
        background-color: gray;
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
    }

    .description {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 2;
    }
</style>
