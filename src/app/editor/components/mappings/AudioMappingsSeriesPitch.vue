<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Note pitch"
            helptext="Enable pitch/frequency control for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the pitch follows the values of a data property."
            horizontal-reverse
            expand-content
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="pitchType"
                :options="pitchTypes"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'fixed'"
            v-slot="slotProps"
            label="Pitch value"
            helptext="Set a specific pitch/frequency value to play for this data series, in Hertz."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="pitchValue"
                :labelledby="slotProps.labelId"
                :min="60"
                :max="4200"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            v-slot="slotProps"
            label="Minimum frequency"
            helptext="Set a minimum pitch/frequency, in Hertz."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="minFreq"
                :labelledby="slotProps.labelId"
                :min="20"
                :max="4200"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            v-slot="slotProps"
            label="Maximum frequency"
            helptext="Set a maximum pitch/frequency, in Hertz."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="maxFreq"
                :labelledby="slotProps.labelId"
                :min="20"
                :max="4200"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            v-slot="slotProps"
            label="Mapping property"
            helptext="Data property to map pitch/frequency to."
            horizontal-reverse
            expand-content
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="pitchMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            v-slot="slotProps"
            fieldset-legend="Polarity"
            is-fieldset
            helptext="Set the polarity of the pitch mapping - whether the audio goes up (positive) or down (negative) in pitch with higher values."
        >
            <SERadioGroup
                :id="slotProps.controlId"
                v-model="pitchPolarity"
                :options="mcpPolarityOptions"
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
    makeSeriesParamPropertyMapping,
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
    data() {
        return {
            mcpPolarityOptions: [{
                value: 'positive', label: 'Positive'
            }, {
                value: 'negative', label: 'Negative'
            }],
            pitchTypes: [{
                name: 'Default',
                value: 'default'
            }, {
                name: 'Fixed',
                value: 'fixed'
            }, {
                name: 'Mapped',
                value: 'mapped'
            }]
        };
    },
    computed: {
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(), // Needed for makeSeriesParamPropertyMapping
        pitchType: makeSeriesParamPropertyMapping('pitchType', 'default', 'pitchOptions'),
        pitchMappingProp: makeSeriesParamPropertyMapping('pitchMappingProp', null, 'pitchOptions'),
        minFreq: makeSeriesParamPropertyMapping('minFreq', null, 'pitchOptions'),
        maxFreq: makeSeriesParamPropertyMapping('maxFreq', null, 'pitchOptions'),
        pitchValue: makeSeriesParamPropertyMapping('pitchValue', null, 'pitchOptions'),
        pitchPolarity: makeSeriesParamPropertyMapping('pitchPolarity', null, 'pitchOptions'),
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
            // These options are needed always in the store so that we can calculate pitch options
            // regardless of which options are changed by the user. By default, only options that
            // are changed by the user are added to the store. Note that we only set the defaults
            // if the data is not already present in the store.
            this.pitchMappingProp = nullFallback(this.pitchMappingProp, 'y');
            this.minFreq = nullFallback(this.minFreq, 330);
            this.maxFreq = nullFallback(this.maxFreq, 3300);
            this.pitchValue = nullFallback(this.pitchValue, 440);
            this.pitchPolarity = nullFallback(this.pitchPolarity, 'positive');
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
