<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Audio enabled"
            helptext="Enable audio playback for this data series."
            horizontal
            helptext-middle
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="sonificationEnabled"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Instrument"
            helptext="The type of instrument to use for playing this data series. Choose below whether or not to play samples of the selected instrument when going through the list."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="instrument"
                :options="instruments"
                @input="onInstrumentChange"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Play audio samples"
            helptext="Play a preview sound as you switch between different instruments in the Instrument list above."
            horizontal
            helptext-middle
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="playSamples"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Round to musical notes"
            helptext="Round all pitches to nearest musical note."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="pitchRoundingEnabled"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SECheckbox from '../basic/SECheckbox.vue';

import {
    makeSeriesParamPropertyMapping,
    makeSelectedAudioMappingSeriesPropertyMapping
} from '../../store/storeUtils';
import {
    nullFallback
} from '../../core/utils/objects';

export default {
    components: {
        SEControl,
        SECheckbox,
        SEDropdown
    },
    data() {
        return {
            instruments: [{
                name: 'Sine wave',
                value: 'sine'
            }, {
                name: 'Triangle wave',
                value: 'triangle'
            }, {
                name: 'Sawtooth wave',
                value: 'sawtooth'
            }, {
                name: 'Square wave',
                value: 'square'
            }],
            playSamples: true
        };
    },
    computed: {
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(), // Needed for makeSeriesParamPropertyMapping
        sonificationEnabled: makeSeriesParamPropertyMapping('sonificationEnabled', true),
        instrument: makeSeriesParamPropertyMapping('instrument', null, 'instrument'),
        pitchRoundingEnabled: makeSeriesParamPropertyMapping('pitchRoundingEnabled', null, 'instrument')
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
        onInstrumentChange() {
            if (this.playSamples) {
                (this as any).$chartBridge.playAudioSample(this.instrument);
            }
        },
        populateProps() {
            this.pitchRoundingEnabled = nullFallback(this.pitchRoundingEnabled, false);
            this.instrument = nullFallback(this.instrument, 'sine');
        }
    }
};
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";

    #mci-sample-btn {
        margin: 12px 0 5px;
    }
</style>
