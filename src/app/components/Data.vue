<template>
    <section aria-label="Data input">
        <div>
            Controls
        </div>
        <div id="gridContainer">
            <Grid />
        </div>
    </section>
</template>

<script lang="ts">
import Grid from './Grid.vue';

export default {
    components: {
        Grid
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        display: flex;
        flex-direction: column;
    }

    #gridContainer {
        flex: 1;
    }
</style>
