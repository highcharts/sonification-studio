<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Invert chart"
            helptext="Make the X axis vertical, and the Y axis horizontal."
            horizontal
            helptext-middle
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
            helptext-middle
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="chartLegendEnabled"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Show data series labels"
            helptext="Show a label next to each data series with its name. Labels may be hidden if no good position is found automatically."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="seriesLabelsEnabled"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Chart zoom"
            helptext="Allow zooming by clicking and dragging in the chart to select a range. When zoomed, hold the Alt/Option key to pan around the chart with the mouse."
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="zoomType"
                :options="zoomTypes"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Data grouping"
            helptext="When there are lots of data points in the chart, data grouping will combine several points into one.<br>Select here whether the points should be summed together when combined, an average should be taken, or the data grouping should be disabled altogether.<br>Selecting default will make an intelligent guess based on the chart type."
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="dataGroupingType"
                :options="dataGroupingTypes"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SEDropdown from '../basic/SEDropdown.vue';

export default {
    components: {
        SEControl,
        SECheckbox,
        SEDropdown
    },
    data() {
        return {
            zoomTypes: [{
                name: 'None',
                value: ''
            }, {
                name: 'X-axis only',
                value: 'x'
            }, {
                name: 'Y-axis only',
                value: 'y'
            }, {
                name: 'Both',
                value: 'xy'
            }],
            dataGroupingTypes: [{
                name: 'None',
                value: ''
            }, {
                name: 'Default',
                value: 'default'
            }, {
                name: 'Average',
                value: 'average'
            }, {
                name: 'Sum',
                value: 'sum'
            }]
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
        },
        zoomType: {
            get() { return (this as any).$store.state.chartParametersStore.zoomType; },
            set(val) { return this.$store.commit('chartParametersStore/setZoomType', val); }
        },
        dataGroupingType: {
            get() { return (this as any).$store.state.chartParametersStore.dataGroupingType; },
            set(val) { return this.$store.commit('chartParametersStore/setDataGroupingType', val); }
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
