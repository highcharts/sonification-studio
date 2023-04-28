<template>
    <div>
        <AudioMappingProp
            store-parent-prop="highpassOptions"
            main-mapping-label="Highpass filter"
            mapping-type-helptext="A highpass filter removes low frequencies, making the sound thinner.<br>Default means there is no filter applied."
            fixed-value-label="Cutoff frequency (Hz)"
            fixed-value-helptext="Set a specific, constant cutoff frequency for the highpass filter, in Hertz."
            :max-range-val="20000"
            :default-min="0"
            :default-max="6000"
            :default-val="1000"
            min-label="Minimum frequency (Hz)"
            max-label="Maximum frequency (Hz)"
            min-helptext="Set a minimum cutoff frequency for the filter, in Hertz."
            max-helptext="Set a maximum cutoff frequency for the filter, in Hertz."
            map-to-label="Map filter to"
            map-to-helptext="The data property to map the filter cutoff frequency to."
            polarity-helptext="Set the polarity of the filter mapping - whether the filter frequency gets higher/thinner (positive) or lower/fuller (negative) as data values go up."
            pos-polarity-label="Full to thin"
            neg-polarity-label="Thin to full"
        />
    </div>
</template>

<script lang="ts">
import AudioMappingProp from './AudioMappingProp.vue';
export default {
    components: {
        AudioMappingProp
    }
};
</script>

<style lang="less" scoped>
    @import "../../accordionOptions";
</style>
