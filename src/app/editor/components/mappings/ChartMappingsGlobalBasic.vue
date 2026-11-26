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
                :options="filteredSeriesTypes"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SEInputbox from '../basic/SEInputbox.vue';
import { seriesTypes } from '../../core/utils/chartUtils';

export default defineComponent({
    components: {
        SEControl,
        SEDropdown,
        SEInputbox
    },
    data() {
        return { seriesTypes };
    },
    computed: {
        filteredSeriesTypes(): typeof seriesTypes {
            const numRows = this.$store.getters['dataStore/numRows'];
            const numCols = this.$store.getters['dataStore/numCols'];
            if (numRows > 50 || numCols >= 3) {
                // Pie doesn't work well with large datasets, limiting to 50 rows, and 2 columns.
                return seriesTypes.filter(type => type.value !== 'pie');
            }
            return seriesTypes;
        },
        chartType: {
            get(): string { return this.$store.state.chartParametersStore.type; },
            set(val: string) { return this.$store.commit('chartParametersStore/setType', val); }
        },
        chartTitle: {
            get(): string { return this.$store.state.chartParametersStore.title; },
            set(val: string) { return this.$store.commit('chartParametersStore/setTitle', val); }
        },
        chartSubtitle: {
            get(): string { return this.$store.state.chartParametersStore.subtitle; },
            set(val: string) { return this.$store.commit('chartParametersStore/setSubtitle', val); }
        }
    }
});
</script>


<style lang="less" scoped>
@import "../../accordionOptions";
</style>
