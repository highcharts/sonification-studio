<template>
    <section aria-label="Data input">
        <GridControls />
        <div id="gridContainer">
            <Grid />
        </div>
    </section>
</template>

<script lang="ts">
import Grid from './Grid.vue';
import GridControls from './GridControls.vue';

export default {
    components: {
        Grid, GridControls
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        display: flex;
        flex-direction: column;
        background-color: @main-content-bg-color;
        padding: 20px;
    }

    #gridContainer {
        flex: 1;
    }
</style>
