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

            <div class="controls-group">
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
            </div>

            <div class="controls-group">
                <SEControl
                    control-id="global-panning"
                    label="Enable panning"
                    helptext="Pan the sound to left and right based on x value"
                    horizontal
                >
                    <SECheckbox
                        id="global-panning"
                        v-model="panenabled"
                    />
                </SEControl>
                <SEControl
                    control-id="global-panwidth"
                    label="Pan width"
                    helptext="How wide to pan the sound when panning is enabled"
                >
                    <SESlider
                        id="global-panwidth"
                        v-model.number="panwidth"
                    />
                </SEControl>
            </div>
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
            set(val) { return this.$store.commit('sonifyParametersStore/setSpeed', val); }
        },
        minfreq: {
            get() { return (this as any).$store.state.sonifyParametersStore.minFrequency; },
            set(val) { return this.$store.commit('sonifyParametersStore/setMinFrequency', val); }
        },
        maxfreq: {
            get() { return (this as any).$store.state.sonifyParametersStore.maxFrequency; },
            set(val) { return this.$store.commit('sonifyParametersStore/setMaxFrequency', val); }
        },
        panenabled: {
            get() { return (this as any).$store.state.sonifyParametersStore.panEnabled; },
            set(val) { return this.$store.commit('sonifyParametersStore/setPanEnabled', val); }
        },
        panwidth: {
            get() { return (this as any).$store.state.sonifyParametersStore.panWidth; },
            set(val) { return this.$store.commit('sonifyParametersStore/setPanWidth', val); }
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

    .controls-group {
        margin-top: 20px;
    }
</style>
