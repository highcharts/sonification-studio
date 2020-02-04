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
    },
    beforeMount: function () {
        this.$store.commit('dataStore/setTableRowData', this.makePlaceholderData());
    },
    methods: {
        makePlaceholderData(): Array<object> {
            const res = [];

            for (let i = 0; i < 175; ++i) {
                res.push({
                    A: '' + i,
                    B: (Math.sin(i / 3) * i / 2).toFixed(3)
                });
            }

            return res;
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
