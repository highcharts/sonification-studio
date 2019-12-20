<template>
    <div>
        <SEControl
            control-id="mcp-enable-pan-mapping"
            label="Enable pan mapping"
            helptext="Helptext for checkbox goes here"
            horizontal
        >
            <SECheckbox id="mcp-enable-pan-mapping" />
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
            label="Slider"
            helptext="Helptext"
        >
            <SESlider id="myid" />
        </SEControl>
    </div>
</template>

<script lang="ts">
import SEControl from './basic/SEControl.vue';
import SESlider from './basic/SESlider.vue';
import SECheckbox from './basic/SECheckbox.vue';

export default {
    components: {
        SEControl,
        SESlider,
        SECheckbox
    }
};
</script>

<style lang="less" scoped>
    .se-control {
        margin: 10px 0;
    }
</style>
