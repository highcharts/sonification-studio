<template>
    <div>
        <SESlider
            id="slider-volume"
            v-model.number="volume"
            :show-value-input="false"
            label="Volume"
            :max="130"
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
                if (keyPressed(Keys.Period, Modifiers.Ctrl, e)) {
                    this.volumeUp();
                    e.preventDefault();
                } else if (keyPressed(Keys.Comma, Modifiers.Ctrl, e)) {
                    this.volumeDown();
                    e.preventDefault();
                }
            }
        });
    },
    methods: {
        volumeUp() {
            const newVol = Math.min((this.volume as number) + 5, 130);
            this.$store.commit('globalSonifyParametersStore/setVolume', newVol);
            this.volume = newVol;
            (this as any).$announcer.announce('Volume up. ' + newVol + '%');
        },
        volumeDown() {
            const newVol = Math.max((this.volume as number) - 5, 0);
            this.$store.commit('globalSonifyParametersStore/setVolume', newVol);
            this.volume = newVol;
            (this as any).$announcer.announce('Volume down. ' + newVol + '%');
        }
    }
};
</script>

<style lang="less" scoped>
</style>
