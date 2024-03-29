<template>
    <div>
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
            label="Audio enabled for series"
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
    makeSeriesParamPropertyGetMapping,
    makeSeriesParamPropertySetMapping,
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
    computed: {
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(), // Needed for makeSeriesParamPropertyMapping
        sonificationEnabled: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'sonificationEnabled', true); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'sonificationEnabled', val); },
        },
        instrument: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'instrument', 'piano', 'instrument'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'instrument', val, 'instrument'); },
        },
        pitchRoundingEnabled: {
            get() { return makeSeriesParamPropertyGetMapping(this, 'pitchRoundingEnabled', false, 'instrument'); },
            set(val) { return makeSeriesParamPropertySetMapping(this, 'pitchRoundingEnabled', val, 'instrument'); },
        },
        instruments() {
            return (this as any).$chartBridge.getAvailableInstruments();
        },
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
            if (this.instrument && this.selectedHeaderTabContent !== 'dataContent') {
                (this as any).$chartBridge.playAudioSample(this.instrument);
            }
        },
        populateProps() {
            this.pitchRoundingEnabled = nullFallback(this.pitchRoundingEnabled, false);
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
