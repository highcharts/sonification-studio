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
                @update:model-value="onInstrumentChange"
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
import { defineComponent } from 'vue';
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import { mapState } from 'pinia';
import { useViewStore } from '../../store/modules/view';
import { getSeriesParameter, setSeriesParameter } from '../../store/storeUtils';
import {
    nullFallback
} from '../../core/utils/objects';

export default defineComponent({
    components: {
        SEControl,
        SECheckbox,
        SEDropdown
    },
    computed: {
        ...mapState(useViewStore, {
            selectedSeries: 'selectedDataSeriesAudioMapping',
            selectedHeaderTabContent: 'selectedHeaderTabContent'
        }),
        sonificationEnabled: {
            get(): boolean { return getSeriesParameter(this.selectedSeries, 'sonificationEnabled', true); },
            set(val: boolean) { setSeriesParameter(this.selectedSeries, 'sonificationEnabled', val); },
        },
        instrument: {
            get(): string { return getSeriesParameter(this.selectedSeries, 'instrument', 'piano', 'instrument'); },
            set(val: string) { setSeriesParameter(this.selectedSeries, 'instrument', val, 'instrument'); },
        },
        pitchRoundingEnabled: {
            get(): boolean { return getSeriesParameter(this.selectedSeries, 'pitchRoundingEnabled', false, 'instrument'); },
            set(val: boolean) { setSeriesParameter(this.selectedSeries, 'pitchRoundingEnabled', val, 'instrument'); },
        },
        instruments(): Array<Record<'name' | 'value', string>> {
            return this.$chartBridge.getAvailableInstruments();
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
        onInstrumentChange() {
            if (this.instrument && this.selectedHeaderTabContent !== 'dataContent') {
                this.$chartBridge.playAudioSample(this.instrument);
            }
        },
        populateProps() {
            this.pitchRoundingEnabled = nullFallback(this.pitchRoundingEnabled, false);
            this.instrument = nullFallback(this.instrument, 'piano');
        }
    }
});
</script>


<style lang="less" scoped>
    @import "../../accordionOptions";

    #mci-sample-btn {
        margin: 12px 0 5px;
    }
</style>
