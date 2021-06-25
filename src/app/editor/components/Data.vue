<template>
    <div
        class="data-container"
        :aria-labelledby="uuid"
    >
        <h2
            :id="uuid"
            class="sr-only"
        >
            Data input
        </h2>
        <GridControls
            @triggerScrollLastGridRowWithData="onTriggerScrollLastGridRowWithData()"
        />
        <div id="gridContainer">
            <Grid ref="grid" />
        </div>
    </div>
</template>

<script lang="ts">
import { getUUID } from '../core/utils/objects';
import Grid from './Grid.vue';
import GridControls from './GridControls.vue';

export default {
    components: {
        Grid, GridControls
    },
    computed: {
        uuid: () => getUUID('se-data-input')
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
    @import "../sr-only";

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
