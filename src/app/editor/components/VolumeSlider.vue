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
import { keyPressed, Modifiers, Keys } from '../core/utils/keyboardUtils';
import { mapState } from 'vuex';
import SESlider from './basic/SESlider.vue';

export default {
    components: {
        SESlider
    },
    computed: {
        ...mapState('viewStore', ['selectedHeaderTabId']),
        volume: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.volume; },
            set(vol) { return this.$store.commit('globalSonifyParametersStore/setVolume', vol); }
        }
    },
    mounted() {
        document.addEventListener('keydown', (e) => {
            if (this.selectedHeaderTabId === 'Chart') {
                if (keyPressed(Keys.Up, Modifiers.Alt, e)) {
                    this.volumeUp();
                    e.preventDefault();
                } else if (keyPressed(Keys.Down, Modifiers.Alt, e)) {
                    this.volumeDown();
                    e.preventDefault();
                }
            }
        });
    },
    methods: {
        volumeUp() {
            this.$store.commit('globalSonifyParametersStore/setVolume', Math.min((this.volume as number) + 5, 100));
        },
        volumeDown() {
            this.$store.commit('globalSonifyParametersStore/setVolume', Math.max((this.volume as number) - 5, 0));
        }
    }
};
</script>

<style lang="less" scoped>
</style>
