<template>
    <div>
        <SEControl
            control-id="mci-sonification-enabled"
            label="Audio enabled"
            helptext="Enable audio playback for this data series."
            horizontal
        >
            <SECheckbox
                id="mci-sonification-enabled"
                v-model="sonificationEnabled"
            />
        </SEControl>

        <SEControl
            control-id="mci-instrument"
            label="Instrument"
            helptext="The type of instrument to use for playing this data series. Click the 'Play audio sample' button below to hear a sample of this instrument."
            :horizontal-reverse="true"
            :expand-content="true"
        >
            <SEDropdown
                id="mci-instrument"
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
            control-id="mci-rounding"
            label="Musical notes only"
            helptext="Round all pitches to nearest musical note."
            horizontal
        >
            <SECheckbox
                id="mci-rounding"
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

export default {
    components: {
        SEControl,
        SECheckbox,
        SEButton,
        SEDropdown
    },
    data: function () {
        return {
            instruments: [{
                name: 'Sine wave',
                value: 'sine'
            }, {
                name: 'Triangle wave',
                value: 'triangle'
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
    mounted: function () {
        this.pitchRoundingEnabled = true;
        this.instrument = 'sine';
    },
    methods: {
        onSampleClick() {
            console.log('TBD');
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
