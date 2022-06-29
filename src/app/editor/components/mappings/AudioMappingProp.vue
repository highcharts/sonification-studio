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
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import {
    makeSeriesParamPropertyGetMapping,
    makeSeriesParamPropertySetMapping,
    makeSelectedAudioMappingSeriesPropertyMapping
} from '../../store/storeUtils';
import {
    getMappingDataProps
} from '../../core/utils/chartUtils';
import {
    nullFallback
} from '../../core/utils/objects';

export default {
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
        defaultMin: { type: Number, default: null },
        defaultMax: { type: Number, default: null },
        defaultVal: { type: Number, default: null },
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
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(), // Needed for makeSeriesParamPropertyMapping
        mappingType: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'mappingType', 'default', (this as any).storeParentProp); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'mappingType', val, (this as any).storeParentProp); }
        },
        mappingProp: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'mapTo', this.defaultMapTo, (this as any).storeParentProp); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'mapTo', val, (this as any).storeParentProp); }
        },
        min: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'min',
                nullFallback(this.defaultMin, this.minRangeVal), (this as any).storeParentProp); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'min', val, (this as any).storeParentProp); }
        },
        max: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'max',
                nullFallback(this.defaultMax, this.maxRangeVal), (this as any).storeParentProp); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'max', val, (this as any).storeParentProp); }
        },
        fixedValue: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'fixedValue',
                nullFallback(this.defaultVal, Math.round((this.maxRangeVal - this.minRangeVal) / 2)), (this as any).storeParentProp); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'fixedValue', val, (this as any).storeParentProp); }
        },
        polarity: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'polarity', 'positive', (this as any).storeParentProp); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'polarity', val, (this as any).storeParentProp); }
        },
        mappingProps() {
            return getMappingDataProps();
        }
    },
    watch: {
        selectedSeries() {
            (this as any).populateProps();
        }
    },
    beforeMount() {
        (this as any).populateProps();
    },
    methods: {
        populateProps() {
            // Init so that these are always in store. Series props do not have a default store state otherwise.
            this.mappingProp = nullFallback(this.mappingProp, 'x');
            this.min = nullFallback(this.min, nullFallback(this.defaultMin, this.minRangeVal));
            this.max = nullFallback(this.max, nullFallback(this.defaultMax, this.maxRangeVal));
            this.fixedValue = nullFallback(this.fixedValue, nullFallback(this.defaultVal, Math.round((this.maxRangeVal - this.minRangeVal) / 2)));
            this.polarity = nullFallback(this.polarity, 'positive');
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
