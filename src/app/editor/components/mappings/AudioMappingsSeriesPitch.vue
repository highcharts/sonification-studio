<template>
    <div>
        <AudioMappingProp
            store-parent-prop="pitchOptions"
            main-mapping-label="Note pitch"
            mapping-type-helptext="Enable pitch/frequency control for this data series.<br>Default means the default setting is used, fixed means a fixed value is used, and mapped means the pitch follows the values of a data property."
            fixed-value-label="Pitch value"
            fixed-value-helptext="Set a specific note value to play for this data series, in number of notes from C0."
            :max-range-val="110"
            :default-min="36"
            :default-max="90"
            min-label="Minimum note"
            max-label="Maximum note"
            min-helptext="Set a minimum pitch/note, in number of notes from C0."
            max-helptext="Set a maximum pitch/note, in number of notes from C0."
            map-to-label="Map note to"
            map-to-helptext="The data property to map note pitch/frequency to."
            polarity-helptext="Set the polarity of the pitch mapping - whether the audio goes up (positive) or down (negative) in pitch with higher values."
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
