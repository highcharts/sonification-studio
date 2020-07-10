<template>
    <div>
        <SEControl
            control-id="mcv-volume-type"
            label="Note volume"
            helptext="Enable volume control for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the volume follows the values of a data property."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mcv-volume-type"
                v-model="volumeType"
                :options="volumeTypes"
            />
        </SEControl>

        <SEControl
            v-show="volumeType === 'fixed'"
            control-id="mcv-volume-value"
            label="Volume value"
            helptext="Set a fixed volume for this data series, from quiet to loud volume."
        >
            <SESlider
                id="mcv-volume-value"
                v-model.number="volumeValue"
                :min="0"
                :max="1.2"
                :step="0.05"
            />
        </SEControl>

        <SEControl
            v-show="volumeType === 'mapped'"
            control-id="mcv-min-volume"
            label="Minimum volume"
            helptext="Set a minimum volume, from quiet to loud."
        >
            <SESlider
                id="mcv-min-volume"
                v-model.number="minVolume"
                :min="0"
                :max="1.2"
                :step="0.05"
            />
        </SEControl>

        <SEControl
            v-show="volumeType === 'mapped'"
            control-id="mcv-max-volume"
            label="Maximum volume"
            helptext="Set a maximum volume, from quiet to loud."
        >
            <SESlider
                id="mcv-max-volume"
                v-model.number="maxVolume"
                :min="0"
                :max="1.2"
                :step="0.05"
            />
        </SEControl>

        <SEControl
            v-show="volumeType === 'mapped'"
            control-id="mcv-mapping-prop"
            label="Mapping property"
            helptext="Data property to map volume to. Volume will follow the values of this data property."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mcv-mapping-prop"
                v-model="volumeMappingProp"
                :options="mappingProps"
            />
        </SEControl>

        <SEControl
            v-show="volumeType === 'mapped'"
            control-id="mcv-volume-polarity"
            label="Polarity"
            helptext="Set the polarity of the volume mapping - whether the audio gets louder or quieter as values get higher."
        >
            <SERadioGroup
                id="mcv-volume-polarity"
                v-model="volumePolarity"
                :options="mcvPolarityOptions"
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
            mcvPolarityOptions: [{
                value: 'positive', label: 'Positive'
            }, {
                value: 'negative', label: 'Negative'
            }],
            volumeTypes: [{
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
        volumeType: makeSeriesParamPropertyMapping('volumeType', 'default', 'volumeOptions'),
        volumeMappingProp: makeSeriesParamPropertyMapping('volumeMappingProp', null, 'volumeOptions'),
        minVolume: makeSeriesParamPropertyMapping('minVolume', null, 'volumeOptions'),
        maxVolume: makeSeriesParamPropertyMapping('maxVolume', null, 'volumeOptions'),
        volumeValue: makeSeriesParamPropertyMapping('volumeValue', null, 'volumeOptions'),
        volumePolarity: makeSeriesParamPropertyMapping('volumePolarity', null, 'volumeOptions'),
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
            this.volumeMappingProp = nullFallback(this.volumeMappingProp, 'y');
            this.minVolume = nullFallback(this.minVolume, 0);
            this.maxVolume = nullFallback(this.maxVolume, 1);
            this.volumeValue = nullFallback(this.volumeValue, 1);
            this.volumePolarity = nullFallback(this.volumePolarity, 'positive');
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
