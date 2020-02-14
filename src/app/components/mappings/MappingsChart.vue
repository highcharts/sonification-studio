<template>
    <section aria-label="Chart settings">
        <h2>Chart settings</h2>
        <div class="controls-container">
            <div class="controls-group">
                <SEControl
                    control-id="chart-legend-enabled"
                    label="Enable legend"
                    helptext="Show a legend with an overview of data series"
                    horizontal
                >
                    <SECheckbox
                        id="chart-legend-enabled"
                        v-model="chartLegendEnabled"
                    />
                </SEControl>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SECheckbox from '../basic/SECheckbox.vue';

export default {
    components: {
        SEControl,
        SECheckbox
    },
    computed: {
        chartLegendEnabled: {
            get() { return (this as any).$store.state.chartParametersStore.legendEnabled; },
            set(val) { return this.$store.commit('chartParametersStore/setLegendEnabled', val); }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";
    @import "../../colors";

    section {
        background-color: @main-content-bg-color;
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

    h2 {
        margin: 20px 5px;
    }

    .controls-container {
        padding: 0 10px;
    }

    .se-control {
        margin: 10px 0;
    }

    .controls-group {
        margin: 20px 0;
    }
</style>
