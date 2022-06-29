<template>
    <div>
        <AudioMappingProp
            store-parent-prop="panOptions"
            main-mapping-label="Note panning"
            mapping-type-helptext="Enable pan for this data series.<br>Default means the default (global) setting is used, fixed means a fixed value is used, and mapped means the panning follows the values of a data property."
            fixed-value-label="Pan value"
            fixed-value-helptext="Set a specific pan value for this data series, from left (0) to right (100). Center is 50."
            min-label="Minimum pan value"
            max-label="Maximum pan value"
            min-helptext="Set a minimum pan value for this series, from left (0) to right (100). Center is 50."
            max-helptext="Set a maximum pan value for this series, from left (0) to right (100). Center is 50."
            default-map-to="x"
            map-to-label="Map panning to"
            map-to-helptext="The data property to map panning to."
            polarity-helptext="Set the direction of the pan mapping - whether the audio pans from left to right (positive), or right to left (negative), as values get higher."
            pos-polarity-label="Left to right"
            neg-polarity-label="Right to left"
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
