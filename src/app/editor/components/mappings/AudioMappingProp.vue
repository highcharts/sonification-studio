<template>
    <div class="audio-mapping-prop-controls">
        <SEControl
            v-slot="slotProps"
            :label="mainMappingLabel"
            :helptext="mappingTypeHelptext"
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="mappingType"
                :options="mappingTypes"
            />
        </SEControl>

        <SEControl
            v-show="mappingType === 'fixed'"
            v-slot="slotProps"
            :label="fixedValueLabel"
            :helptext="fixedValueHelptext"
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="fixedValue"
                :labelledby="slotProps.labelId"
                :min="minRangeVal"
                :max="maxRangeVal"
                :step="rangeStep"
            />
        </SEControl>

        <SEControl
            v-show="mappingType === 'mapped'"
            v-slot="slotProps"
            :label="minLabel"
            :helptext="minHelptext"
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="min"
                :labelledby="slotProps.labelId"
                :min="minRangeVal"
                :max="maxRangeVal"
                :step="rangeStep"
            />
        </SEControl>

        <SEControl
            v-show="mappingType === 'mapped'"
            v-slot="slotProps"
            :label="maxLabel"
            :helptext="maxHelptext"
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="max"
                :labelledby="slotProps.labelId"
                :min="minRangeVal"
                :max="maxRangeVal"
                :step="rangeStep"
            />
        </SEControl>

        <SEControl
            v-show="mappingType === 'mapped'"
            v-slot="slotProps"
            :label="mapToLabel"
            :helptext="mapToHelptext"
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="mappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="mappingType === 'mapped'"
            v-slot="slotProps"
            :fieldset-legend="polarityLabel"
            is-fieldset
            compact-content
            :helptext="polarityHelptext"
        >
            <SERadioGroup
                :id="slotProps.controlId"
                v-model="polarity"
                :options="polarityOptions"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import { mapState } from 'pinia';
import { useViewStore } from '../../store/modules/view';
import { getSeriesParameter, setSeriesParameter } from '../../store/storeUtils';
import {
    getMappingDataProps
} from '../../core/utils/chartUtils';
import {
    nullFallback
} from '../../core/utils/objects';

export default defineComponent({
    components: {
        SEControl,
        SESlider,
        SEDropdown,
        SERadioGroup
    },
    props: {
        storeParentProp: { type: String, required: true },
        mainMappingLabel: { type: String, required: true },
        mappingTypeHelptext: { type: String, required: true },
        fixedValueLabel: { type: String, required: true },
        fixedValueHelptext: { type: String, required: true },
        minLabel: { type: String, required: true },
        minHelptext: { type: String, required: true },
        maxLabel: { type: String, required: true },
        maxHelptext: { type: String, required: true },
        mapToLabel: { type: String, required: true },
        mapToHelptext: { type: String, required: true },
        polarityHelptext: { type: String, required: true },
        polarityLabel: { type: String, default: 'Mapping direction' },
        posPolarityLabel: { type: String, default: 'Low to high' },
        negPolarityLabel: { type: String, default: 'High to low' },
        defaultMapTo: { type: String, default: 'y' },
        defaultMin: { type: Number as PropType<number | null>, default: null },
        defaultMax: { type: Number as PropType<number | null>, default: null },
        defaultVal: { type: Number as PropType<number | null>, default: null },
        minRangeVal: { type: Number, default: 0 },
        maxRangeVal: { type: Number, default: 100 },
        rangeStep: { type: Number, default: 1 },
    },
    data() {
        return {
            polarityOptions: [{
                value: 'positive', label: this.posPolarityLabel
            }, {
                value: 'negative', label: this.negPolarityLabel
            }],
            mappingTypes: [
                { name: 'Default', value: 'default' },
                { name: 'Fixed', value: 'fixed' },
                { name: 'Mapped', value: 'mapped' }
            ]
        };
    },
    computed: {
        ...mapState(useViewStore, { selectedSeries: 'selectedDataSeriesAudioMapping' }),
        // Defaults for when the series does not have the parameters
        minDefault(): number {
            return this.defaultMin ?? this.minRangeVal;
        },
        maxDefault(): number {
            return this.defaultMax ?? this.maxRangeVal;
        },
        fixedValueDefault(): number {
            return this.defaultVal ?? Math.round((this.maxRangeVal - this.minRangeVal) / 2);
        },
        mappingType: {
            get(): string { return getSeriesParameter(this.selectedSeries, 'mappingType', 'default', this.storeParentProp); },
            set(val: string) { setSeriesParameter(this.selectedSeries, 'mappingType', val, this.storeParentProp); }
        },
        mappingProp: {
            get(): string { return getSeriesParameter(this.selectedSeries, 'mapTo', this.defaultMapTo, this.storeParentProp); },
            set(val: string) { setSeriesParameter(this.selectedSeries, 'mapTo', val, this.storeParentProp); }
        },
        min: {
            get(): number { return getSeriesParameter(this.selectedSeries, 'min', this.minDefault, this.storeParentProp); },
            set(val: number) { setSeriesParameter(this.selectedSeries, 'min', val, this.storeParentProp); }
        },
        max: {
            get(): number { return getSeriesParameter(this.selectedSeries, 'max', this.maxDefault, this.storeParentProp); },
            set(val: number) { setSeriesParameter(this.selectedSeries, 'max', val, this.storeParentProp); }
        },
        fixedValue: {
            get(): number { return getSeriesParameter(this.selectedSeries, 'fixedValue', this.fixedValueDefault, this.storeParentProp); },
            set(val: number) { setSeriesParameter(this.selectedSeries, 'fixedValue', val, this.storeParentProp); }
        },
        polarity: {
            get(): string { return getSeriesParameter(this.selectedSeries, 'polarity', 'positive', this.storeParentProp); },
            set(val: string) { setSeriesParameter(this.selectedSeries, 'polarity', val, this.storeParentProp); }
        },
        mappingProps() {
            return getMappingDataProps();
        }
    },
    watch: {
        selectedSeries() {
            this.populateProps();
        }
    },
    beforeMount() {
        this.populateProps();
    },
    methods: {
        populateProps() {
            // Init so that these are always in store. Series props do not have a default store state otherwise.
            this.mappingProp = nullFallback(this.mappingProp, 'x');
            this.min = nullFallback(this.min, this.minDefault);
            this.max = nullFallback(this.max, this.maxDefault);
            this.fixedValue = nullFallback(this.fixedValue, this.fixedValueDefault);
            this.polarity = nullFallback(this.polarity, 'positive');
        }
    }
});
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
