<template>
    <section aria-label="Chart settings">
        <h2>Chart settings</h2>
        <div class="controls-container">
            <SEControl
                control-id="chart-type"
                label="Type"
                helptext="The type of chart to draw"
            >
                <SEDropdown
                    id="chart-type"
                    v-model="chartType"
                    :options="chartTypes"
                />
            </SEControl>

            <SEControl
                control-id="chart-title"
                label="Title"
                helptext="The chart title text"
            >
                <SETextbox
                    id="chart-title"
                    v-model="chartTitle"
                />
            </SEControl>

            <SEControl
                control-id="chart-subtitle"
                label="Subtitle"
                helptext="The chart subtitle text"
            >
                <SETextbox
                    id="chart-subtitle"
                    v-model="chartSubtitle"
                />
            </SEControl>

            <SEControl
                control-id="chart-xaxis-title"
                label="X-Axis title"
                helptext="Title text for the chart's X axis"
            >
                <SETextbox
                    id="chart-xaxis-title"
                    v-model="xAxisTitle"
                />
            </SEControl>

            <SEControl
                control-id="chart-yaxis-title"
                label="Y-Axis title"
                helptext="Title text for the chart's Y axis"
            >
                <SETextbox
                    id="chart-yaxis-title"
                    v-model="yAxisTitle"
                />
            </SEControl>

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
    </section>
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
    data: function () {
        return {
            chartTypes: [{
                name: 'Line',
                value: 'line'
            }, {
                name: 'Smoothed line',
                value: 'spline',
                selected: true
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
        margin: 10px 0 20px;
    }
</style>
