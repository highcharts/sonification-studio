<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Note duration"
            helptext="Enable duration control for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the note duration follows the values of a data property. Be aware that notes may be cut short depending on the overall playback speed setting."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="durationType"
                :options="durationTypes"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'fixed'"
            v-slot="slotProps"
            label="Duration value"
            helptext="Set a fixed note duration for this data series, from short to long notes. Notes may be cut short depending on the overall playback speed setting."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="durationValue"
                :labelledby="slotProps.labelId"
                :min="40"
                :max="3000"
                :step="10"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            v-slot="slotProps"
            label="Minimum duration"
            helptext="Set a minimum duration, from short to long."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="minDuration"
                :labelledby="slotProps.labelId"
                :min="40"
                :max="3000"
                :step="10"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            v-slot="slotProps"
            label="Maximum duration"
            helptext="Set a maximum duration, from short to long."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="maxDuration"
                :labelledby="slotProps.labelId"
                :min="40"
                :max="3000"
                :step="10"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            v-slot="slotProps"
            label="Mapping property"
            helptext="Data property to map note duration to. Note duration will follow the values of this data property. Notes may be cut short depending on the overall playback speed setting."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="durationMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            v-slot="slotProps"
            fieldset-legend="Polarity"
            is-fieldset
            helptext="Set the polarity of the duration mapping - whether the notes gets shorter or longer as values get higher."
        >
            <SERadioGroup
                :id="slotProps.controlId"
                v-model="durationPolarity"
                :options="mcdPolarityOptions"
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
            mcdPolarityOptions: [{
                value: 'positive', label: 'Positive'
            }, {
                value: 'negative', label: 'Negative'
            }],
            durationTypes: [{
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
        durationType: makeSeriesParamPropertyMapping('durationType', 'default', 'durationOptions'),
        durationMappingProp: makeSeriesParamPropertyMapping('durationMappingProp', null, 'durationOptions'),
        minDuration: makeSeriesParamPropertyMapping('minDuration', null, 'durationOptions'),
        maxDuration: makeSeriesParamPropertyMapping('maxDuration', null, 'durationOptions'),
        durationValue: makeSeriesParamPropertyMapping('durationValue', null, 'durationOptions'),
        durationPolarity: makeSeriesParamPropertyMapping('durationPolarity', null, 'durationOptions'),
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
            // Init so that these are always in store, see Pitch mapping component.
            this.durationMappingProp = nullFallback(this.durationMappingProp, 'y');
            this.minDuration = nullFallback(this.minDuration, 200);
            this.maxDuration = nullFallback(this.maxDuration, 2000);
            this.durationValue = nullFallback(this.durationValue, 400);
            this.durationPolarity = nullFallback(this.durationPolarity, 'positive');
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
