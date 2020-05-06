<template>
    <div>
        <SEControl
            control-id="mcp-enable-pan-mapping"
            label="Enable pan mapping"
            helptext="Helptext for checkbox goes here"
            horizontal
        >
            <SECheckbox
                id="mcp-enable-pan-mapping"
                v-model="panEnabled"
            />
        </SEControl>

        <SEControl
            control-id="mcp-enable-sweep"
            label="Enable sweep"
            helptext="Helptext for sweep option goes here"
            horizontal
        >
            <SECheckbox id="mcp-enable-sweep" />
        </SEControl>

        <SEControl
            control-id="myid"
            label="Example slider"
            helptext="Helptext goes here"
        >
            <SESlider id="myid" />
        </SEControl>

        <SEControl
            control-id="mcp-polarity"
            label="Polarity"
            helptext="Set the polarity of the audio mapping."
        >
            <SERadioGroup
                id="mcp-polarity"
                :options="mcpPolarityOptions"
            />
        </SEControl>
    </div>
</template>


<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import {
    makeSeriesParamPropertyMapping,
    makeSelectedAudioMappingSeriesPropertyMapping
} from '../../../store/storeUtils';


export default {
    components: {
        SEControl,
        SESlider,
        SECheckbox,
        SERadioGroup
    },
    data: function () {
        return {
            mcpPolarityOptions: [{
                value: 'pos', label: 'Positive', selected: true
            }, {
                value: 'neg', label: 'Negative'
            }]
        };
    },
    computed: {
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(),
        panEnabled: makeSeriesParamPropertyMapping('panEnabled', false)
    }
};
</script>


<style lang="less" scoped>
    .se-control {
        margin: 10px 0;
    }
</style>
