<template>
    <div>
        <h2>Visual settings: Data series</h2>
        <div class="controls-container">
            <SEControl
                v-slot="slotProps"
                label="Series"
                helptext="The data series to apply settings to"
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="selectedSeries"
                    :options="dataSeries"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Visible"
                helptext="Make the data series visible on the chart or not. Visually hidden series do not play back in audio."
                horizontal
            >
                <SECheckbox
                    :id="slotProps.controlId"
                    v-model="seriesVisible"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Type"
                helptext="Override the chart type for this specific data series"
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="seriesType"
                    :options="seriesTypes"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Name"
                helptext="The data series name in the chart"
            >
                <SETextbox
                    :id="slotProps.controlId"
                    v-model="seriesName"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Color"
                helptext="The color of the data series in the chart"
                horizontal-reverse
            >
                <SEColorPicker
                    :id="slotProps.controlId"
                    v-model="seriesColor"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Dash style"
                helptext="The data series dash style for lines and borders"
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="dashStyle"
                    :options="dashStyles"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Show data point labels"
                helptext="Show a label on the chart for each data point in this series. Labels may be hidden if no good position is found automatically"
                horizontal
            >
                <SECheckbox
                    :id="slotProps.controlId"
                    v-model="dataLabelsEnabled"
                />
            </SEControl>
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SETextbox from '../basic/SETextbox.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SEColorPicker from '../basic/SEColorPicker.vue';
import { GenericObject } from '../../../core/utils/objects';
import { getSeriesId } from '../../../core/utils/chartUtils';
import { makeSeriesParamPropertyMapping } from '../../../store/storeUtils';
import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SETextbox,
        SEDropdown,
        SECheckbox,
        SEColorPicker
    },
    data() {
        return {
            seriesTypes: [{
                name: 'Default',
                value: null
            }, {
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
                name: 'Pie',
                value: 'pie'
            }, {
                name: 'Scatter',
                value: 'scatter'
            }],
            dashStyles: [{
                name: 'Solid',
                value: null
            }, {
                name: 'Dash',
                value: 'Dash'
            }, {
                name: 'Dot',
                value: 'Dot'
            }, {
                name: 'Short dash',
                value: 'ShortDash'
            }, {
                name: 'Short dot',
                value: 'ShortDot'
            }, {
                name: 'Long dash',
                value: 'LongDash'
            }, {
                name: 'Dash dot',
                value: 'DashDot'
            }]
        };
    },
    computed: {
        ...mapState({
            reactToDataUpdates: (state: any) => state.viewStore.reactToDataUpdates
        }),
        selectedSeries: {
            get() { return (this as any).$store.state.viewStore.selectedDataSeriesChartMapping; },
            set(val) { return this.$store.commit('viewStore/setSelectedDataSeriesChartMapping', val); }
        },
        dataSeries() {
            const chartBridge = (this as any).$chartBridge;
            const series = chartBridge?.reactiveGet('getDataSeries', this.reactToDataUpdates) || [];

            return series.map((s: GenericObject) => ({
                name: s.name,
                value: getSeriesId(s)
            }));
        },
        seriesName: makeSeriesParamPropertyMapping('seriesName'),
        seriesType: makeSeriesParamPropertyMapping('seriesType'),
        seriesColor: makeSeriesParamPropertyMapping('seriesColor', '#ffffff'),
        dashStyle: makeSeriesParamPropertyMapping('dashStyle'),
        dataLabelsEnabled: makeSeriesParamPropertyMapping('dataLabelsEnabled'),
        seriesVisible: makeSeriesParamPropertyMapping('seriesVisible', true)
    },
    watch: {
        seriesType(type: unknown) {
            if (!type) {
                // Force update if clearing series type by resetting to default
                this.$store.commit('viewStore/triggerParameterReactivity');
            }
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
