<template>
    <div>
        <SESlider
            id="slider-playback"
            label="Playback"
            :value="0"
            dark
        />
    </div>
</template>

<script lang="ts">
import SESlider from './basic/SESlider.vue';

export default {
    components: {
        SESlider
    }
};
</script>

<style lang="less" scoped>
</style>
