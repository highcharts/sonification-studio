<template>
    <div>
        <AudioMappingProp
            store-parent-prop="volumeOptions"
            main-mapping-label="Note volume"
            mapping-type-helptext="Enable volume control for this data series.<br>Default means the default setting is used, fixed means a fixed value is used, and mapped means the volume follows the values of a data property."
            fixed-value-label="Volume value"
            fixed-value-helptext="Set a fixed volume for this data series, from quiet (0) to loud (100) volume."
            :default-val="100"
            min-label="Minimum volume"
            max-label="Maximum volume"
            min-helptext="Set a minimum volume, from quiet (0) to loud (100)."
            max-helptext="Set a maximum volume, from quiet (0) to loud (100)."
            map-to-label="Map volume to"
            map-to-helptext="Data property to map volume to. Volume will follow the values of this data property."
            polarity-helptext="Set the polarity of the volume mapping - whether the audio gets louder (positive) or quieter (negative) as values get higher."
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
