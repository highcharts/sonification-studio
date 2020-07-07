<template>
    <div>
        <SEControl
            control-id="mcp-pan-type"
            label="Enable pan"
            helptext="Enable pan for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the panning follows the values of a data property."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mcp-pan-type"
                v-model="panType"
                :options="panTypes"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'fixed'"
            control-id="mcp-pan-value"
            label="Pan value"
            helptext="Set a specific pan value for this data series, from left to right."
        >
            <SESlider
                id="mcp-pan-value"
                v-model.number="panValue"
                :min="-1"
                :max="1"
                :step="0.05"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            control-id="mcp-min-pan"
            label="Minimum pan value"
            helptext="Set a minimum pan value. If direction is from left to right, -1 refers to left. Otherwise it refers to right."
        >
            <SESlider
                id="mcp-min-pan"
                v-model.number="minPan"
                :min="-1"
                :max="1"
                :step="0.05"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            control-id="mcp-max-pan"
            label="Maximum pan value"
            helptext="Set a maximum pan value. If direction is from left to right, -1 refers to left. Otherwise it refers to right."
        >
            <SESlider
                id="mcp-max-pan"
                v-model.number="maxPan"
                :min="-1"
                :max="1"
                :step="0.05"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            control-id="mcp-mapping-prop"
            label="Mapping property"
            helptext="Data property to map panning to."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mcp-mapping-prop"
                v-model="panMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            control-id="mcp-polarity"
            label="Direction"
            helptext="Set the polarity of the pan mapping - whether the audio pans from left to right, or right to left."
        >
            <SERadioGroup
                id="mcp-polarity"
                v-model="panDirection"
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
            mcpPolarityOptions: [{
                value: 'positive', label: 'Left to right'
            }, {
                value: 'negative', label: 'Right to left'
            }],
            panTypes: [{
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
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(),
        panType: makeSeriesParamPropertyMapping('panType', 'default'),
        panMappingProp: makeSeriesParamPropertyMapping('panMappingProp', 'x'),
        minPan: makeSeriesParamPropertyMapping('minPan', 0),
        maxPan: makeSeriesParamPropertyMapping('maxPan', 0),
        panValue: makeSeriesParamPropertyMapping('panValue', 0),
        panDirection: makeSeriesParamPropertyMapping('panDirection', 'positive'),
        mappingProps: function () {
            return getMappingDataProps();
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
