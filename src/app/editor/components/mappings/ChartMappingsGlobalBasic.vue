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
import { mapState, mapStores } from 'pinia';
import { useChartParametersStore } from '../../store/modules/chartParameters';
import { useDataStore } from '../../store/modules/data';

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
        ...mapStores(useChartParametersStore),
        ...mapState(useDataStore, ['numRows', 'numCols']),
        filteredSeriesTypes(): typeof seriesTypes {
            if (this.numRows > 50 || this.numCols >= 3) {
                // Pie doesn't work well with large datasets, limiting to 50 rows, and 2 columns.
                return seriesTypes.filter(type => type.value !== 'pie');
            }
            return seriesTypes;
        },
        chartType: {
            get(): string { return this.chartParametersStore.type; },
            set(val: string) { this.chartParametersStore.setType(val); }
        },
        chartTitle: {
            get(): string { return this.chartParametersStore.title; },
            set(val: string) { this.chartParametersStore.setTitle(val); }
        },
        chartSubtitle: {
            get(): string { return this.chartParametersStore.subtitle; },
            set(val: string) { this.chartParametersStore.setSubtitle(val); }
        }
    }
});
</script>


<style lang="less" scoped>
@import "../../accordionOptions";
</style>
