<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Invert chart"
            helptext="Make the X axis vertical, and the Y axis horizontal."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="chartInverted"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Enable legend"
            helptext="Show a legend overview box in the chart with a list of data series."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="chartLegendEnabled"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Show data series labels"
            helptext="Show a label on the chart for each data series. Labels may be hidden if no good position is found automatically."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="seriesLabelsEnabled"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SECheckbox from '../basic/SECheckbox.vue';

export default {
    components: {
        SEControl,
        SECheckbox
    },
    data() {
        return {
        };
    },
    computed: {
        chartLegendEnabled: {
            get() { return (this as any).$store.state.chartParametersStore.legendEnabled; },
            set(val) { return this.$store.commit('chartParametersStore/setLegendEnabled', val); }
        },
        chartInverted: {
            get() { return (this as any).$store.state.chartParametersStore.inverted; },
            set(val) { return this.$store.commit('chartParametersStore/setChartInverted', val); }
        },
        seriesLabelsEnabled: {
            get() { return (this as any).$store.state.chartParametersStore.seriesLabelsEnabled; },
            set(val) { return this.$store.commit('chartParametersStore/setSeriesLabelsEnabled', val); }
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
