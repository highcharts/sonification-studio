<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Chart Title"
            helptext="The chart title text."
        >
            <SEInputbox
                :id="slotProps.controlId"
                v-model="chartTitle"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Chart Subtitle"
            helptext="The chart subtitle text."
        >
            <SEInputbox
                :id="slotProps.controlId"
                v-model="chartSubtitle"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Chart Type"
            helptext="The type of chart to draw."
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="chartType"
                :options="seriesTypes"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SEInputbox from '../basic/SEInputbox.vue';
import { seriesTypes } from '../../core/utils/chartUtils';

export default {
    components: {
        SEControl,
        SEDropdown,
        SEInputbox
    },
    data() {
        return { seriesTypes };
    },
    computed: {
        chartType: {
            get() { return (this as any).$store.state.chartParametersStore.type; },
            set(val) { return this.$store.commit('chartParametersStore/setType', val); }
        },
        chartTitle: {
            get() { return (this as any).$store.state.chartParametersStore.title; },
            set(val) { return this.$store.commit('chartParametersStore/setTitle', val); }
        },
        chartSubtitle: {
            get() { return (this as any).$store.state.chartParametersStore.subtitle; },
            set(val) { return this.$store.commit('chartParametersStore/setSubtitle', val); }
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
