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

import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SECheckbox,
        SEDropdown
    },
    data() {
        return {
            playSamples: true
        };
    },
    computed: {
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(), // Needed for makeSeriesParamPropertyMapping
        sonificationEnabled: makeSeriesParamPropertyMapping('sonificationEnabled', true),
        instrument: makeSeriesParamPropertyMapping('instrument', null, 'instrument'),
        instruments() {
            return Object.keys(
                (this as any).$chartBridge.Highcharts.sonification.InstrumentPresets
            ).map(i => ({
                name: i[0].toUpperCase() + i.slice(1),
                value: i
            }));
        },
        pitchRoundingEnabled: makeSeriesParamPropertyMapping('pitchRoundingEnabled', null, 'instrument'),
        ...mapState('viewStore', ['selectedHeaderTabContent'])
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
            if (this.playSamples && this.instrument && this.selectedHeaderTabContent !== 'dataContent') {
                (this as any).$chartBridge.playAudioSample(this.instrument);
            }
        },
        populateProps() {
            this.pitchRoundingEnabled = nullFallback(this.pitchRoundingEnabled, true);
            this.instrument = nullFallback(this.instrument, 'piano');
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
