<template>
    <div>
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
            label="Shared tooltip"
            helptext="Share a single tooltip between the data series."
            horizontal
            helptext-middle
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="sharedTooltipEnabled"
            />
        </SEControl>

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
            label="Chart Zoom"
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
            label="Data Grouping"
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
import { defineComponent } from 'vue';
import SEControl from '../basic/SEControl.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import { mapStores } from 'pinia';
import { useChartParametersStore } from '../../store/modules/chartParameters';

export default defineComponent({
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
        ...mapStores(useChartParametersStore),
        chartLegendEnabled: {
            get(): boolean { return this.chartParametersStore.legendEnabled; },
            set(val: boolean) { this.chartParametersStore.setLegendEnabled(val); }
        },
        sharedTooltipEnabled: {
            get(): boolean { return this.chartParametersStore.sharedTooltipEnabled; },
            set(val: boolean) { this.chartParametersStore.setSharedTooltipEnabled(val); }
        },
        chartInverted: {
            get(): boolean { return this.chartParametersStore.inverted; },
            set(val: boolean) { this.chartParametersStore.setChartInverted(val); }
        },
        seriesLabelsEnabled: {
            get(): boolean { return this.chartParametersStore.seriesLabelsEnabled; },
            set(val: boolean) { this.chartParametersStore.setSeriesLabelsEnabled(val); }
        },
        zoomType: {
            get(): string { return this.chartParametersStore.zoomType; },
            set(val: string) { this.chartParametersStore.setZoomType(val); }
        },
        dataGroupingType: {
            get(): string { return this.chartParametersStore.dataGroupingType; },
            set(val: string) { this.chartParametersStore.setDataGroupingType(val); }
        }
    }
});
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
