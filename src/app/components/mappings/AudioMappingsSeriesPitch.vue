<template>
    <div>
        <SEControl
            control-id="mcp-pitch-type"
            label="Note pitch"
            helptext="Enable pitch/frequency control for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the pitch follows the values of a data property."
            horizontal-reverse
            expand-content
        >
            <SEDropdown
                id="mcp-pitch-type"
                v-model="pitchType"
                :options="pitchTypes"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'fixed'"
            control-id="mcp-pitch-value"
            label="Pitch value"
            helptext="Set a specific pitch/frequency value to play for this data series."
        >
            <SESlider
                id="mcp-pitch-value"
                v-model.number="pitchValue"
                :min="100"
                :max="8000"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            control-id="mcp-min-freq"
            label="Minimum frequency"
            helptext="Set a minimum pitch/frequency."
        >
            <SESlider
                id="mcp-min-freq"
                v-model.number="minFreq"
                :min="20"
                :max="20000"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            control-id="mcp-max-freq"
            label="Maximum frequency"
            helptext="Set a maximum pitch/frequency."
        >
            <SESlider
                id="mcp-max-freq"
                v-model.number="maxFreq"
                :min="20"
                :max="20000"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            control-id="mcp-mapping-prop"
            label="Mapping property"
            helptext="Data property to map pitch/frequency to."
            horizontal-reverse
            expand-content
        >
            <SEDropdown
                id="mcp-mapping-prop"
                v-model="pitchMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            control-id="mcp-rounding"
            label="Pitch rounding"
            helptext="Round pitch to nearest musical note."
            horizontal
        >
            <SECheckbox
                id="mcp-rounding"
                v-model="pitchRoundingEnabled"
            />
        </SEControl>

        <SEControl
            v-show="pitchType === 'mapped'"
            control-id="mcp-polarity"
            label="Polarity"
            helptext="Set the polarity of the pitch mapping - whether the audio goes up or down in pitch with higher values."
        >
            <SERadioGroup
                id="mcp-polarity"
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
import SECheckbox from '../basic/SECheckbox.vue';
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
        SECheckbox,
        SERadioGroup
    },
    data: function () {
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
        pitchType: makeSeriesParamPropertyMapping('pitchType', 'default'),
        pitchMappingProp: makeSeriesParamPropertyMapping('pitchMappingProp', 'y'),
        pitchRoundingEnabled: makeSeriesParamPropertyMapping('pitchRoundingEnabled', true),
        minFreq: makeSeriesParamPropertyMapping('minFreq', 330),
        maxFreq: makeSeriesParamPropertyMapping('maxFreq', 3300),
        pitchValue: makeSeriesParamPropertyMapping('pitchValue', 440),
        pitchPolarity: makeSeriesParamPropertyMapping('pitchPolarity', 'positive'),
        mappingProps: function () {
            return getMappingDataProps();
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
