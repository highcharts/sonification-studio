<template>
    <div>
        <SESlider
            id="slider-playback"
            :value="0"
            dark
        >
            Playback
        </SESlider>
    </div>
</template>

<script lang="ts">
import SESlider from './SESlider.vue';

export default {
    components: {
        SESlider
    }
};
</script>

<style lang="less" scoped>
</style>
