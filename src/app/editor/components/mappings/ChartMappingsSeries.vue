<template>
    <div
        role="tabpanel"
        aria-labelledby="chartmappingseries-heading"
    >
        <h4 id="chartmappingseries-heading">
            Visual settings: Data series
        </h4>
        <div class="controls-container">
            <SEControl
                v-slot="slotProps"
                label="Series"
                helptext="The data series to edit and apply settings to."
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="selectedSeries"
                    :options="dataSeries"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Series Name"
                helptext="The name of this data series in the chart."
            >
                <SEInputbox
                    :id="slotProps.controlId"
                    v-model="seriesName"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Series Visible"
                helptext="Make the data series visible on the chart or not. Visually hidden series do not play back in audio."
                horizontal
                helptext-middle
            >
                <SECheckbox
                    :id="slotProps.controlId"
                    v-model="seriesVisible"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Series Chart Type"
                helptext="Override the chart type for this specific data series."
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="seriesType"
                    :options="seriesTypes"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Color"
                helptext="The color of this data series in the chart."
                horizontal-reverse
                helptext-middle
            >
                <SEColorPicker
                    :id="slotProps.controlId"
                    v-model="seriesColor"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Opacity"
                helptext="The opacity of the data series color. Set to 0 to make the series invisible, but still audible."
            >
                <SESlider
                    :id="slotProps.controlId"
                    v-model.number="seriesOpacity"
                    :labelledby="slotProps.labelId"
                    :min="0"
                    :max="100"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Line Style"
                helptext="The line dash style for this data series' lines and borders."
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="dashStyle"
                    :options="dashStyles"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Show in legend"
                helptext="Show this data series in the chart legend if the chart legend is enabled."
                horizontal
                helptext-middle
            >
                <SECheckbox
                    :id="slotProps.controlId"
                    v-model="seriesShowInLegend"
                />
            </SEControl>

            <SEControl
                v-slot="slotProps"
                label="Show data point labels"
                helptext="Show a label on the chart for each data point in this series. Labels may be hidden if no good position is found automatically."
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
import SEInputbox from '../basic/SEInputbox.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SESlider from '../basic/SESlider.vue';
import SEColorPicker from '../basic/SEColorPicker.vue';
import { GenericObject } from '../../core/utils/objects';
import { getSeriesId, seriesTypes } from '../../core/utils/chartUtils';
import {
    makeSeriesParamPropertyGetMapping,
    makeSeriesParamPropertySetMapping
} from '../../store/storeUtils';
import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SEInputbox,
        SEDropdown,
        SECheckbox,
        SEColorPicker,
        SESlider
    },
    data() {
        return {
            seriesTypes: [{
                name: 'Default',
                value: null
            }].concat(seriesTypes as any),
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
        seriesName: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'seriesName'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'seriesName', val); }
        },
        seriesColor: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'seriesColor', '#ffffff'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'seriesColor', val); }
        },
        seriesOpacity: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'seriesOpacity', 100); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'seriesOpacity', val); }
        },
        dashStyle: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'dashStyle'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'dashStyle', val); }
        },
        dataLabelsEnabled: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'dataLabelsEnabled'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'dataLabelsEnabled', val); }
        },
        seriesVisible: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'seriesVisible', true); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'seriesVisible', val); }
        },
        seriesShowInLegend: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'seriesShowInLegend', true); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'seriesShowInLegend', val); }
        },
        seriesType: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'seriesType'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'seriesType', val); }
        }
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

    h4 {
        margin: 10px 5px 10px;
    }

    .controls-container {
        padding: 0 10px;
    }

    .se-control {
        margin: 10px 0 20px;
        &:last-child {
            margin-bottom: 0;
        }
        &:first-child {
            margin-top: 0;
        }
    }
</style>
