<template>
    <div class="data-container">
        <GridControls
            @triggerScrollLastGridRowWithData="onTriggerScrollLastGridRowWithData()"
        />
        <div id="gridContainer">
            <Grid ref="grid" />
        </div>
    </div>
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

    .data-container {
        display: flex;
        flex-direction: column;
        background-color: @main-content-bg-color;
        padding: 20px;
        padding-top: 15px;
    }

    #gridContainer {
        flex: 1;
    }
</style>
