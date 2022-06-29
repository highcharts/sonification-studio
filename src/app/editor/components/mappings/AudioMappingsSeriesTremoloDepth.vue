<template>
    <div>
        <AudioMappingProp
            store-parent-prop="tremoloDepthOptions"
            main-mapping-label="Tremolo depth"
            mapping-type-helptext="Enable tremolo depth control for this data series.<br>Default means the default setting is used, fixed means a fixed value is used, and mapped means the depth follows the values of a data property."
            fixed-value-label="Depth value"
            fixed-value-helptext="Set a fixed tremolo depth for this data series, from low (0) to high (100)."
            :default-val="60"
            :range-step="0.1"
            min-label="Minimum depth"
            max-label="Maximum depth"
            min-helptext="Set a minimum depth, from shallow (0) to deep (100)."
            max-helptext="Set a maximum depth, from shallow (0) to deep (100)."
            map-to-label="Map depth to"
            map-to-helptext="Data property to map tremolo depth to. Depth will follow the values of this data property."
            polarity-helptext="Set the polarity of the depth mapping - whether the depth gets deeper (positive) or shallower (negative) as values get higher."
            pos-polarity-label="Shallow to deep"
            neg-polarity-label="Deep to shallow"
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
