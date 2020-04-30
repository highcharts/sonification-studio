<template>
    <div>
        <h2>Data series settings</h2>
        <div class="controls-container">
            <SEControl
                control-id="series-selector"
                label="Series"
                helptext="The data series to apply settings to"
            >
                <SEDropdown
                    id="series-selector"
                    v-model="selectedSeries"
                    :options="dataSeries"
                />
            </SEControl>

            <SEControl
                control-id="series-type"
                label="Type"
                helptext="Override the chart type for this specific data series"
            >
                <SEDropdown
                    id="series-type"
                    v-model="seriesType"
                    :options="seriesTypes"
                />
            </SEControl>

            <SEControl
                control-id="series-name"
                label="Name"
                helptext="The data series name in the chart"
            >
                <SETextbox
                    id="series-name"
                    v-model="seriesName"
                />
            </SEControl>

            <SEControl
                control-id="series-color"
                label="Color"
                helptext="The color of the data series in the chart"
                horizontal-reverse
            >
                <SEColorPicker
                    id="series-color"
                    v-model="seriesColor"
                />
            </SEControl>

            <SEControl
                control-id="dash-style"
                label="Dash style"
                helptext="The data series dash style for lines and borders"
            >
                <SEDropdown
                    id="dash-style"
                    v-model="dashStyle"
                    :options="dashStyles"
                />
            </SEControl>

            <SEControl
                control-id="series-datalabels-enabled"
                label="Show data point labels"
                helptext="Show a label on the chart for each data point in this series. Labels may be hidden if no good position is found automatically"
                horizontal
            >
                <SECheckbox
                    id="series-datalabels-enabled"
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
import { mapState } from 'vuex';

function makeSeriesParamSetterAndGetter(param: string, defaultValue: any = null) {
    return {
        get() {
            const allParams = (this as any).$store.state.seriesParametersStore.seriesParameters;
            const seriesParams = allParams[(this as any).selectedSeries];
            return (seriesParams && seriesParams[param]) ?? defaultValue;
        },
        set(val: any) {
            const selectedSeries = (this as any).selectedSeries;
            if (selectedSeries) {
                (this as any).$store.commit('seriesParametersStore/setSeriesParameter', {
                    seriesId: selectedSeries,
                    parameterName: param,
                    parameterValue: val
                });
            }
        }
    };
}

export default {
    components: {
        SEControl,
        SETextbox,
        SEDropdown,
        SECheckbox,
        SEColorPicker
    },
    data: function () {
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
        dataSeries: function () {
            const chartBridge = (this as any).$chartBridge;
            const series = chartBridge?.reactiveGet('getDataSeries', this.reactToDataUpdates) || [];

            return series.map((s: GenericObject) => ({
                name: s.name,
                value: getSeriesId(s)
            }));
        },
        seriesName: makeSeriesParamSetterAndGetter('seriesName'),
        seriesType: makeSeriesParamSetterAndGetter('seriesType'),
        seriesColor: makeSeriesParamSetterAndGetter('seriesColor', '#ffffff'),
        dashStyle: makeSeriesParamSetterAndGetter('dashStyle'),
        dataLabelsEnabled: makeSeriesParamSetterAndGetter('dataLabelsEnabled')
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
