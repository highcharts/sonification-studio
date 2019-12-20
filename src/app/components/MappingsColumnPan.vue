<template>
    <div>
        <SEControl
            label-id="myid"
            label="Label goes here"
            helptext="Helptext"
            horizontal
        >
            <SESlider labelledby="myid" />
        </SEControl>
    </div>
</template>

<script lang="ts">
import SEControl from './basic/SEControl.vue';
import SESlider from './basic/SESlider.vue';

export default {
    components: {
        SEControl,
        SESlider
    }
};
</script>

<style lang="less" scoped>
</style>
