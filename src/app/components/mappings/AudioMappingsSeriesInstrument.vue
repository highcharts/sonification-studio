<template>
    <div>
        <SEControl
            v-slot="slotProps"
            label="Audio enabled"
            helptext="Enable audio playback for this data series."
            horizontal
        >
            <SECheckbox
                :id="slotProps.controlId"
                v-model="sonificationEnabled"
            />
        </SEControl>

        <SEControl
            v-slot="slotProps"
            label="Instrument"
            helptext="The type of instrument to use for playing this data series. Click the 'Play audio sample' button below to hear a sample of this instrument."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                :id="slotProps.controlId"
                v-model="instrument"
                :options="instruments"
            />
        </SEControl>

        <SEButton
            id="mci-sample-btn"
            @click="onSampleClick"
        >
            Play audio sample
        </SEButton>

        <SEControl
            v-slot="slotProps"
            label="Musical notes only"
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
import SEButton from '../basic/SEButton.vue';

import {
    makeSeriesParamPropertyMapping,
    makeSelectedAudioMappingSeriesPropertyMapping
} from '../../../store/storeUtils';
import {
    nullFallback
} from '../../../core/utils/objects';

export default {
    components: {
        SEControl,
        SECheckbox,
        SEButton,
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
            }]
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
        onSampleClick() {
            (this as any).$chartBridge.playAudioSample(this.instrument);
        },
        populateProps() {
            this.pitchRoundingEnabled = nullFallback(this.pitchRoundingEnabled, true);
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
