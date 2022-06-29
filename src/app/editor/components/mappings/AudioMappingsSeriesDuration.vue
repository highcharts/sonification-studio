<template>
    <div>
        <AudioMappingProp
            store-parent-prop="durationOptions"
            main-mapping-label="Note duration"
            mapping-type-helptext="Enable note duration control for this data series. Default means the default setting is used, fixed means a fixed value is used, and mapped means the note duration follows the values of a data property. Be aware that long notes may be cut short if your playback speed or detail settings are too high."
            fixed-value-label="Duration value"
            fixed-value-helptext="Set a fixed note duration for this data series, from short to long notes, in milliseconds. Be aware that long notes may be cut short if your playback speed or detail settings are too high."
            :min-range-val="15"
            :max-range-val="3000"
            :default-min="80"
            :default-max="600"
            :default-val="300"
            min-label="Minimum duration"
            max-label="Maximum duration"
            min-helptext="Set a minimum duration, from short to long, in milliseconds."
            max-helptext="Set a maximum duration, from short to long, in milliseconds. Be aware that long notes may be cut short if your playback speed or detail settings are too high."
            map-to-label="Map duration to"
            map-to-helptext="The data property to map note duration to."
            polarity-helptext="Set the polarity of the duration mapping - whether the notes gets shorter (negative) or longer (positive) as values get higher."
            pos-polarity-label="Short to long"
            neg-polarity-label="Long to short"
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
