<template>
    <div>
        <SESlider
            id="slider-playback"
            label="Playback"
            :show-value="false"
            :value="playbackProgress"
            dark
            disabled
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
    input {
        cursor: default !important;
    }
</style>
