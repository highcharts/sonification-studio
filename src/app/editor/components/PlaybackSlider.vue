<template>
    <div>
        <SESlider
            id="slider-playback"
            label="Playback"
            :show-value-input="false"
            :model-value="playbackProgress"
            disabled
            arrow-thumb
            dark-on-light
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SESlider from './basic/SESlider.vue';
import { mapState } from 'pinia';
import { useViewStore } from '../store/modules/view';

export default defineComponent({
    components: {
        SESlider
    },
    computed: {
        ...mapState(useViewStore, ['playbackProgress'])
    }
});
</script>

<style lang="less" scoped>
    input {
        cursor: default !important;
    }
</style>
