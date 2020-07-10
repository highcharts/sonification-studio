<template>
    <div>
        <h2>Audio settings: Global</h2>
        <div class="controls-container">
            <div class="controls-group">
                <SEControl
                    control-id="global-speed"
                    label="Speed"
                    helptext="Set the playing speed."
                >
                    <SESlider
                        id="global-speed"
                        v-model.number="speed"
                    />
                </SEControl>
                <SEControl
                    control-id="global-playmarker"
                    label="Enable chart play marker"
                    helptext="Show the current play position on the chart."
                    horizontal
                >
                    <SECheckbox
                        id="global-playmarker"
                        v-model="playMarkerEnabled"
                    />
                </SEControl>
                <SEControl
                    control-id="global-order"
                    label="Data series order"
                    helptext="Which order to play the data series in, either one after the other, or simultaneously."
                >
                    <SERadioGroup
                        id="global-order"
                        v-model="order"
                        :options="orderOptions"
                    />
                </SEControl>
            </div>

            <h3>Default settings</h3>
            <div class="controls-group">
                <SEControl
                    control-id="global-minfreq"
                    label="Min frequency"
                    helptext="The lowest note to play."
                >
                    <SESlider
                        id="global-minfreq"
                        v-model.number="minFreq"
                        :min="60"
                        :max="4200"
                    />
                </SEControl>
                <SEControl
                    control-id="global-maxfreq"
                    label="Max frequency"
                    helptext="The highest note to play."
                >
                    <SESlider
                        id="global-maxfreq"
                        v-model.number="maxFreq"
                        :min="60"
                        :max="4200"
                    />
                </SEControl>
            </div>

            <div class="controls-group">
                <SEControl
                    control-id="global-panning"
                    label="Enable panning"
                    helptext="Pan the sound to left and right based on x value."
                    horizontal
                >
                    <SECheckbox
                        id="global-panning"
                        v-model="panEnabled"
                    />
                </SEControl>
                <SEControl
                    control-id="global-panwidth"
                    label="Pan width"
                    helptext="How wide to pan the sound when panning is enabled."
                >
                    <SESlider
                        id="global-panwidth"
                        v-model.number="panWidth"
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
import SERadioGroup from '../basic/SERadioGroup.vue';

export default {
    components: {
        SEControl,
        SESlider,
        SECheckbox,
        SERadioGroup
    },
    data: function () {
        return {
            orderOptions: [{
                label: 'Sequential',
                value: 'sequential'
            }, {
                label: 'Simultaneous',
                value: 'simultaneous'
            }]
        };
    },
    computed: {
        speed: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.speed; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setSpeed', val); }
        },
        playMarkerEnabled: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.playMarkerEnabled; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPlayMarkerEnabled', val); }
        },
        order: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.order; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setOrder', val); }
        },
        minFreq: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.minFrequency; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setMinFrequency', val); }
        },
        maxFreq: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.maxFrequency; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setMaxFrequency', val); }
        },
        panEnabled: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.panEnabled; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPanEnabled', val); }
        },
        panWidth: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.panWidth; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPanWidth', val); }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h2 {
        margin: 20px 5px;
    }

    h3 {
        margin: 30px 0 0;
    }

    .controls-container {
        padding: 0 10px;
    }

    .se-control {
        margin: 20px 0;
    }

    .controls-group {
        margin: 20px 0;
    }
</style>
