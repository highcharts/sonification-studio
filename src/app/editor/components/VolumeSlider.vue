<template>
    <div>
        <SESlider
            id="slider-volume"
            v-model.number="volume"
            :show-value-input="false"
            label="Volume"
            dark
            show-value-in-label
            value-is-pct
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
            get() { return (this as any).$store.state.globalSonifyParametersStore.volume; },
            set(vol) { return this.$store.commit('globalSonifyParametersStore/setVolume', vol); }
        }
    }
};
</script>

<style lang="less" scoped>
</style>
