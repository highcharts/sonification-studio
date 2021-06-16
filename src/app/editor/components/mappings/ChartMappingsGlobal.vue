<template>
    <div
        role="tabpanel"
        aria-labelledby="chartmappingsglobal-heading"
    >
        <h2 id="chartmappingsglobal-heading">
            Visual settings: Global
        </h2>
        <div class="controls-container">
            <SEControl
                v-slot="slotProps"
                label="Type"
                helptext="The type of chart to draw"
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="chartType"
                    :options="chartTypes"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Title"
                helptext="The chart title text"
            >
                <SETextbox
                    :id="slotProps.controlId"
                    v-model="chartTitle"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Subtitle"
                helptext="The chart subtitle text"
            >
                <SETextbox
                    :id="slotProps.controlId"
                    v-model="chartSubtitle"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="X-Axis title"
                helptext="Title text for the chart's X axis"
            >
                <SETextbox
                    :id="slotProps.controlId"
                    v-model="xAxisTitle"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Y-Axis title"
                helptext="Title text for the chart's Y axis"
            >
                <SETextbox
                    :id="slotProps.controlId"
                    v-model="yAxisTitle"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Enable legend"
                helptext="Show a legend with an overview of data series"
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
                helptext="Show a label on the chart for each data series. Labels may be hidden if no good position is found automatically"
                horizontal
            >
                <SECheckbox
                    :id="slotProps.controlId"
                    v-model="seriesLabelsEnabled"
                />
            </SEControl>
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SETextbox from '../basic/SETextbox.vue';
import SEDropdown from '../basic/SEDropdown.vue';

export default {
    components: {
        SEControl,
        SECheckbox,
        SETextbox,
        SEDropdown
    },
    data() {
        return {
            chartTypes: [{
                name: 'Line',
                value: 'line'
            }, {
                name: 'Smoothed line',
                value: 'spline'
            }, {
                name: 'Area',
                value: 'area'
            }, {
                name: 'Smoothed area',
                value: 'areaspline'
            }, {
                name: 'Column',
                value: 'column'
            }, {
                name: 'Bar',
                value: 'bar'
            }, {
                name: 'Pie',
                value: 'pie'
            }, {
                name: 'Scatter',
                value: 'scatter'
            }]
        };
    },
    computed: {
        chartType: {
            get() { return (this as any).$store.state.chartParametersStore.type; },
            set(val) { return this.$store.commit('chartParametersStore/setType', val); }
        },
        chartLegendEnabled: {
            get() { return (this as any).$store.state.chartParametersStore.legendEnabled; },
            set(val) { return this.$store.commit('chartParametersStore/setLegendEnabled', val); }
        },
        chartTitle: {
            get() { return (this as any).$store.state.chartParametersStore.title; },
            set(val) { return this.$store.commit('chartParametersStore/setTitle', val); }
        },
        chartSubtitle: {
            get() { return (this as any).$store.state.chartParametersStore.subtitle; },
            set(val) { return this.$store.commit('chartParametersStore/setSubtitle', val); }
        },
        xAxisTitle: {
            get() { return (this as any).$store.state.chartParametersStore.xAxisTitle; },
            set(val) { return this.$store.commit('chartParametersStore/setXAxisTitle', val); }
        },
        yAxisTitle: {
            get() { return (this as any).$store.state.chartParametersStore.yAxisTitle; },
            set(val) { return this.$store.commit('chartParametersStore/setYAxisTitle', val); }
        },
        seriesLabelsEnabled: {
            get() { return (this as any).$store.state.chartParametersStore.seriesLabelsEnabled; },
            set(val) { return this.$store.commit('chartParametersStore/setSeriesLabelsEnabled', val); }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h2 {
        margin: 20px 5px;
    }

    .controls-container {
        padding: 0 10px;
    }

    .se-control {
        margin: 10px 0 20px;
    }
</style>
