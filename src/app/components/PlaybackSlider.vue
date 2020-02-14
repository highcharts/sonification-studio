<template>
    <div>
        <SESlider
            id="slider-playback"
            label="Playback"
            :value="playbackProgress"
            dark
        />
    </div>
</template>

<script lang="ts">
import SESlider from './basic/SESlider.vue';
import { mapState } from 'vuex';

export default {
    components: {
        SESlider
    },
    computed: mapState('viewStore', ['playbackProgress']),
};
</script>

<style lang="less" scoped>
</style>
