<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Note panning"
            helptext="Enable pan for this data series.<br>Default means the default (global) setting is used, fixed means a fixed value is used, and mapped means the panning follows the values of a data property."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="panType"
                :options="panTypes"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'fixed'"
            v-slot="slotProps"
            label="Pan value"
            helptext="Set a specific pan value for this data series, from left (0) to right (100)."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="panValue"
                :labelledby="slotProps.labelId"
                :min="0"
                :max="100"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            v-slot="slotProps"
            label="Minimum pan value"
            helptext="Set a minimum pan value, from left (0) to right (100)."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="minPan"
                :labelledby="slotProps.labelId"
                :min="0"
                :max="100"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            v-slot="slotProps"
            label="Maximum pan value"
            helptext="Set a maximum pan value, from left (0) to right (100)."
        >
            <SESlider
                :id="slotProps.controlId"
                v-model.number="maxPan"
                :labelledby="slotProps.labelId"
                :min="0"
                :max="100"
                :step="1"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            v-slot="slotProps"
            label="Mapping property"
            helptext="The data property to map panning to."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="panMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="panType === 'mapped'"
            v-slot="slotProps"
            fieldset-legend="Direction"
            is-fieldset
            compact-content
            helptext="Set the polarity of the pan mapping - whether the audio pans from left to right (positive), or right to left (negative), as values get higher."
        >
            <SERadioGroup
                :id="slotProps.controlId"
                v-model="panPolarity"
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
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(), // Needed for makeSeriesParamPropertyMapping
        panType: makeSeriesParamPropertyMapping('panType', 'default', 'panOptions'),
        panMappingProp: makeSeriesParamPropertyMapping('panMappingProp', null, 'panOptions'),
        minPan: makeSeriesParamPropertyMapping('minPan', null, 'panOptions'),
        maxPan: makeSeriesParamPropertyMapping('maxPan', null, 'panOptions'),
        panValue: makeSeriesParamPropertyMapping('panValue', null, 'panOptions'),
        panPolarity: makeSeriesParamPropertyMapping('panPolarity', null, 'panOptions'),
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
            this.panMappingProp = nullFallback(this.panMappingProp, 'x');
            this.minPan = nullFallback(this.minPan, 0);
            this.maxPan = nullFallback(this.maxPan, 100);
            this.panValue = nullFallback(this.panValue, 50);
            this.panPolarity = nullFallback(this.panPolarity, 'positive');
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
