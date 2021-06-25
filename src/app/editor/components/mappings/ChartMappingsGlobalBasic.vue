<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Type"
            helptext="The type of chart to draw."
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
            helptext="The chart title text."
        >
            <SETextbox
                :id="slotProps.controlId"
                v-model="chartTitle"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Subtitle"
            helptext="The chart subtitle text."
        >
            <SETextbox
                :id="slotProps.controlId"
                v-model="chartSubtitle"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SETextbox from '../basic/SETextbox.vue';

export default {
    components: {
        SEControl,
        SEDropdown,
        SETextbox
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
