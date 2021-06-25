<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Y-Axis title"
            helptext="Title text for the chart's Y axis."
        >
            <SETextbox
                :id="slotProps.controlId"
                v-model="yAxisTitle"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Y-Axis type"
            :helptext="'The type of the Y-axis. ' + axisHelptext"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="yAxisType"
                :options="axisTypes"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Y-axis visible"
            helptext="Whether or not the Y-axis should be visible on the chart."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="yAxisVisible"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SETextbox from '../basic/SETextbox.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import { axisTypes, axisHelptext } from '../../core/utils/chartUtils';

export default {
    components: {
        SEControl,
        SEDropdown,
        SETextbox,
        SECheckbox
    },
    data() {
        return {
            axisTypes,
            axisHelptext
        };
    },
    computed: {
        yAxisTitle: {
            get() { return (this as any).$store.state.chartParametersStore.yAxisTitle; },
            set(val) { return this.$store.commit('chartParametersStore/setYAxisTitle', val); }
        },
        yAxisType: {
            get() { return (this as any).$store.state.chartParametersStore.yAxisType; },
            set(val) { return this.$store.commit('chartParametersStore/setYAxisType', val); }
        },
        yAxisVisible: {
            get() { return (this as any).$store.state.chartParametersStore.yAxisVisible; },
            set(val) { return this.$store.commit('chartParametersStore/setYAxisVisible', val); }
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
