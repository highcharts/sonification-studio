<template>
    <div>
        <SEControl
            control-id="mcd-duration-type"
            label="Note duration"
            helptext="Enable duration control for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the note duration follows the values of a data property."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mcd-duration-type"
                v-model="durationType"
                :options="durationTypes"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'fixed'"
            control-id="mcd-duration-value"
            label="Duration value"
            helptext="Set a fixed note duration for this data series, from short to long notes."
        >
            <SESlider
                id="mcd-duration-value"
                v-model.number="durationValue"
                :min="40"
                :max="3000"
                :step="10"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            control-id="mcd-min-duration"
            label="Minimum duration"
            helptext="Set a minimum duration, from short to long."
        >
            <SESlider
                id="mcd-min-duration"
                v-model.number="minDuration"
                :min="40"
                :max="3000"
                :step="10"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            control-id="mcd-max-duration"
            label="Maximum duration"
            helptext="Set a maximum duration, from short to long."
        >
            <SESlider
                id="mcd-max-duration"
                v-model.number="maxDuration"
                :min="40"
                :max="3000"
                :step="10"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            control-id="mcd-mapping-prop"
            label="Mapping property"
            helptext="Data property to map note duration to. Note duration will follow the values of this data property."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mcd-mapping-prop"
                v-model="durationMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="durationType === 'mapped'"
            control-id="mcd-duration-polarity"
            label="Polarity"
            helptext="Set the polarity of the duration mapping - whether the notes gets shorter or longer as values get higher."
        >
            <SERadioGroup
                id="mcd-duration-polarity"
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
} from '../../../store/storeUtils';
import {
    getMappingDataProps
} from '../../../core/utils/chartUtils';
import {
    nullFallback
} from '../../../core/utils/objects';

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
    beforeMount() {
        // Init so that these are always in store, see Pitch mapping component.
        this.durationMappingProp = nullFallback(this.durationMappingProp, 'y');
        this.minDuration = nullFallback(this.minDuration, 200);
        this.maxDuration = nullFallback(this.maxDuration, 2000);
        this.durationValue = nullFallback(this.durationValue, 400);
        this.durationPolarity = nullFallback(this.durationPolarity, 'positive');
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
