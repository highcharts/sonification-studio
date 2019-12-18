<template>
    <main>
        <section class="fullscreen">
            Data input
        </section>
        <section class="sidebar">
            Mapping controls
        </section>
        <section class="sidebar">
            Customize controls
        </section>
        <section class="preview">
            Preview
        </section>
        <section class="description">
            Text description
        </section>
    </main>
</template>

<script lang="ts">
export default {
};
</script>

<style lang="less" scoped>
    main {
        display: grid;
        grid-template-rows: 3fr 1fr;
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
    }

    .description {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 2;
    }
</style>
