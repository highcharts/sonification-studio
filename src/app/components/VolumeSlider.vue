<template>
    <div>
        <SESlider
            id="slider-volume"
            v-model.number="volume"
            label="Volume"
            dark
        />
    </div>
</template>

<script lang="ts">
import SESlider from './basic/SESlider.vue';

export default {
    components: {
        SESlider
    },
    computed: {
        volume: {
            get() { return this.$store.state.sonifyParametersStore.volume; },
            set(vol) { return this.$store.commit('sonifyParametersStore/setVolume', vol); }
        }
    }
};
</script>

<style lang="less" scoped>
</style>
