<template>
    <div>
        <AudioMappingProp
            store-parent-prop="tremoloSpeedOptions"
            main-mapping-label="Tremolo speed"
            mapping-type-helptext="A tremolo effect causes the volume of the sound to repeatedly go up and down. Tremolo speed controls how fast the volume is changing.<br>Default means the default setting is used, fixed means a fixed value is used, and mapped means the speed follows the values of a data property."
            fixed-value-label="Speed value"
            fixed-value-helptext="Set a fixed tremolo speed for this data series, from slow (0) to fast (100)."
            :default-val="60"
            :range-step="0.1"
            min-label="Minimum speed"
            max-label="Maximum speed"
            min-helptext="Set a minimum speed, from slow (0) to fast (100)."
            max-helptext="Set a maximum speed, from slow (0) to fast (100)."
            map-to-label="Map speed to"
            map-to-helptext="Data property to map tremolo speed to. Speed will follow the values of this data property."
            polarity-helptext="Set the polarity of the speed mapping - whether the speed gets faster (positive) or slower (negative) as values get higher."
            pos-polarity-label="Slow to fast"
            neg-polarity-label="Fast to slow"
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
