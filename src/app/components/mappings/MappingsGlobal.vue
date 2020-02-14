<template>
    <div>
        <h2>Mappings: Global</h2>
        <div class="controls-container">
            <SEControl
                control-id="global-speed"
                label="Speed"
                helptext="Set the playing speed"
            >
                <SESlider
                    id="global-speed"
                    v-model.number="speed"
                />
            </SEControl>
            <SEControl
                control-id="global-minfreq"
                label="Min frequency"
                helptext="The lowest note to play"
            >
                <SESlider
                    id="global-minfreq"
                    v-model.number="minfreq"
                    :min="100"
                    :max="4000"
                />
            </SEControl>
            <SEControl
                control-id="global-maxfreq"
                label="Max frequency"
                helptext="The highest note to play"
            >
                <SESlider
                    id="global-maxfreq"
                    v-model.number="maxfreq"
                    :min="100"
                    :max="4000"
                />
            </SEControl>
            <SEControl
                control-id="global-panning"
                label="Enable panning"
                helptext="Pan the sound to left and right based on x value"
                horizontal
            >
                <SECheckbox
                    id="global-panning"
                    v-model="panning"
                />
            </SEControl>
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SECheckbox from '../basic/SECheckbox.vue';

export default {
    components: {
        SEControl,
        SESlider,
        SECheckbox
    },
    computed: {
        speed: {
            get() { return (this as any).$store.state.sonifyParametersStore.speed; },
            set(speed) { return this.$store.commit('sonifyParametersStore/setSpeed', speed); }
        },
        minfreq: {
            get() { return (this as any).$store.state.sonifyParametersStore.minimumFrequency; },
            set(minfreq) { return this.$store.commit('sonifyParametersStore/setMinimumFrequency', minfreq); }
        },
        maxfreq: {
            get() { return (this as any).$store.state.sonifyParametersStore.maximumFrequency; },
            set(maxfreq) { return this.$store.commit('sonifyParametersStore/setMaximumFrequency', maxfreq); }
        },
        panning: {
            get() { return (this as any).$store.state.sonifyParametersStore.panning; },
            set(panning) { return this.$store.commit('sonifyParametersStore/setPanning', panning); }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h2 {
        margin: 20px 5px;
    }

    .controls-container {
        padding: 5px 10px;
    }

    .se-control {
        margin: 10px 0;
    }
</style>
