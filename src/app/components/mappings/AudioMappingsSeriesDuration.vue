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
                :min="50"
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
                :min="50"
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
                :min="50"
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

export default {
    components: {
        SEControl,
        SESlider,
        SEDropdown,
        SERadioGroup
    },
    data: function () {
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
        durationType: makeSeriesParamPropertyMapping('durationType', 'default'),
        durationMappingProp: makeSeriesParamPropertyMapping('durationMappingProp', 'y'),
        minDuration: makeSeriesParamPropertyMapping('minDuration', 200),
        maxDuration: makeSeriesParamPropertyMapping('maxDuration', 2000),
        durationValue: makeSeriesParamPropertyMapping('durationValue', 400),
        durationPolarity: makeSeriesParamPropertyMapping('durationPolarity', 'positive'),
        mappingProps: function () {
            return getMappingDataProps();
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
