<template>
    <div>
        <SEControl
            v-slot="slotProps"
            :label="axis + '-Axis Title'"
            :helptext="`Title text for the chart's ${axis}-axis.`"
        >
            <SEInputbox
                :id="slotProps.controlId"
                v-model="axisTitle"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            :label="axis + '-Axis Type'"
            :helptext="`The type of the ${axis}-axis. ${axisHelptext}`"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="axisType"
                :options="axisTypes"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            :label="axis + '-axis Visible'"
            :helptext="`Whether or not the ${axis}-axis should be visible on the chart.`"
            horizontal
            helptext-middle
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="axisVisible"
            />
        </SEControl>

        <div class="minmax-container">
            <SEControl
                v-slot="slotProps"
                label="Minimum"
                :helptext="`Set desired minimum ${axis}-axis value. Note that the chart might round this up or down depending on the data.<br>Leave blank to let the chart make an automatic choice.`"
                helptext-middle
            >
                <SEInputbox
                    :id="slotProps.controlId"
                    v-model="axisMin"
                    type="number"
                />
            </SEControl>
            <SEControl
                v-slot="slotProps"
                label="Maximum"
                :helptext="`Set desired maximum ${axis}-axis value. Note that the chart might round this up or down depending on the data.<br>Leave blank to let the chart make an automatic choice.`"
            >
                <SEInputbox
                    :id="slotProps.controlId"
                    v-model="axisMax"
                    type="number"
                />
            </SEControl>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SEInputbox from '../basic/SEInputbox.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import { mapStores } from 'pinia';
import { useChartParametersStore } from '../../store/modules/chartParameters';

type Axis = 'X' | 'Y';

// The axis as used in the names of chart parameters (e.g. xAxisTitle)
const lowercaseAxes: Record<Axis, Lowercase<Axis>> = { X: 'x', Y: 'y' };

export default defineComponent({
    components: {
        SEControl,
        SEDropdown,
        SEInputbox,
        SECheckbox
    },
    props: {
        axis: { type: String as PropType<Axis>, required: true }
    },
    data() {
        return {
            axisTypes: [{
                name: 'Linear',
                value: 'linear'
            }, {
                name: 'Logarithmic',
                value: 'logarithmic'
            }, {
                name: 'Category',
                value: 'category'
            }, {
                name: 'Date',
                value: 'datetime'
            }],
            axisHelptext: 'Linear is a continuous axis from one value to another.<br>Logarithmic is the same, but displayed so that smaller values are given a larger portion of the axis.<br>A category axis is simply a set of categories, where each category can be unrelated to the other.<br>A date axis shows time, where the time value is given as UNIX timestamps (milliseconds since 1970), and displayed as human readable dates/time in the chart.'
        };
    },
    computed: {
        ...mapStores(useChartParametersStore),
        axisLowercase(): Lowercase<Axis> {
            return lowercaseAxes[this.axis];
        },
        axisTitle: {
            get(): string { return this.chartParametersStore[`${this.axisLowercase}AxisTitle`]; },
            set(val: string) { this.chartParametersStore[`set${this.axis}AxisTitle`](val); }
        },
        axisType: {
            get(): string { return this.chartParametersStore[`${this.axisLowercase}AxisType`]; },
            set(val: string) { this.chartParametersStore[`set${this.axis}AxisType`](val); }
        },
        axisVisible: {
            get(): boolean { return this.chartParametersStore[`${this.axisLowercase}AxisVisible`]; },
            set(val: boolean) { this.chartParametersStore[`set${this.axis}AxisVisible`](val); }
        },
        axisMin: {
            get(): string { return this.chartParametersStore[`${this.axisLowercase}AxisMin`]; },
            set(val: string) { this.chartParametersStore[`set${this.axis}AxisMin`](val); }
        },
        axisMax: {
            get(): string { return this.chartParametersStore[`${this.axisLowercase}AxisMax`]; },
            set(val: string) { this.chartParametersStore[`set${this.axis}AxisMax`](val); }
        }
    }
});
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";

    .minmax-container {
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        .se-control {
            max-width: 48%;
            margin: 0;
        }
    }
</style>
