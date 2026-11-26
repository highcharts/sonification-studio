<template>
    <div>
        <SESlider
            id="slider-volume"
            v-model.number="volume"
            :show-value-input="false"
            label="Volume"
            :max="130"
            dark-on-light
            show-value-in-label
            value-is-pct
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { keyPressed, Modifiers, Keys } from '../core/utils/keyboardUtils';
import { mapState } from 'vuex';
import SESlider from './basic/SESlider.vue';

export default defineComponent({
    components: {
        SESlider
    },
    computed: {
        ...mapState('viewStore', ['selectedHeaderTabId']),
        volume: {
            get(): number { return this.$store.state.globalSonifyParametersStore.volume; },
            set(vol: number) { this.$store.commit('globalSonifyParametersStore/setVolume', vol); }
        }
    },
    mounted() {
        document.addEventListener('keydown', this.onDocumentKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onDocumentKeydown);
    },
    methods: {
        onDocumentKeydown(e: KeyboardEvent) {
            if (this.selectedHeaderTabId === 'Chart') {
                if (keyPressed(Keys.Period, Modifiers.Ctrl, e)) {
                    this.volumeUp();
                    e.preventDefault();
                } else if (keyPressed(Keys.Comma, Modifiers.Ctrl, e)) {
                    this.volumeDown();
                    e.preventDefault();
                }
            }
        },
        volumeUp() {
            const newVol = Math.min(this.volume + 5, 130);
            this.$store.commit('globalSonifyParametersStore/setVolume', newVol);
            this.volume = newVol;
            this.$announcer.announce('Volume up. ' + newVol + '%');
        },
        volumeDown() {
            const newVol = Math.max(this.volume - 5, 0);
            this.$store.commit('globalSonifyParametersStore/setVolume', newVol);
            this.volume = newVol;
            this.$announcer.announce('Volume down. ' + newVol + '%');
        }
    }
});
</script>

<style lang="less" scoped>
</style>
