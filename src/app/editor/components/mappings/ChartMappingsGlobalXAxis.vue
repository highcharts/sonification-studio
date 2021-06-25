<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="X-Axis title"
            helptext="Title text for the chart's X axis."
        >
            <SETextbox
                :id="slotProps.controlId"
                v-model="xAxisTitle"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="X-Axis type"
            :helptext="'The type of the X-axis. ' + axisHelptext"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="xAxisType"
                :options="axisTypes"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="X-axis visible"
            helptext="Whether or not the X-axis should be visible on the chart."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="xAxisVisible"
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
        xAxisTitle: {
            get() { return (this as any).$store.state.chartParametersStore.xAxisTitle; },
            set(val) { return this.$store.commit('chartParametersStore/setXAxisTitle', val); }
        },
        xAxisType: {
            get() { return (this as any).$store.state.chartParametersStore.xAxisType; },
            set(val) { return this.$store.commit('chartParametersStore/setXAxisType', val); }
        },
        xAxisVisible: {
            get() { return (this as any).$store.state.chartParametersStore.xAxisVisible; },
            set(val) { return this.$store.commit('chartParametersStore/setXAxisVisible', val); }
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
