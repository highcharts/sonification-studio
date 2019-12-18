<template>
    <main>
        <section
            id="dataContent"
            class="fullscreen"
            :class="{ show: selectedView === 'dataContent' }"
        >
            Data input
        </section>

        <section
            id="mappingsContent"
            class="sidebar"
            :class="{ show: selectedView === 'mappingsContent' }"
        >
            Mapping controls
        </section>

        <section
            id="customizeContent"
            class="sidebar"
            :class="{ show: selectedView === 'customizeContent' }"
        >
            Customize controls
        </section>

        <section
            class="preview"
            :class="{ show: selectedView !== 'dataContent' }"
        >
            Preview
        </section>

        <section
            class="description"
            :class="{ show: selectedView !== 'dataContent' }"
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
        background-color: white;
        display: none;
    }

    .show {
        display: block;
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
