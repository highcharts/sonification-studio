<template>
    <section aria-label="Data input">
        <GridControls
            @triggerScrollLastGridRowWithData="onTriggerScrollLastGridRowWithData()"
        />
        <div id="gridContainer">
            <Grid ref="grid" />
        </div>
    </section>
</template>

<script lang="ts">
import Grid from './Grid.vue';
import GridControls from './GridControls.vue';

export default {
    components: {
        Grid, GridControls
    },
    methods: {
        onTriggerScrollLastGridRowWithData() {
            (this.$refs.grid as any).scrollToLastGridRowWithData();
        }
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
