<template>
    <div
        role="tabpanel"
        aria-labelledby="audiomappingsglobal-heading"
    >
        <h2 id="audiomappingsglobal-heading">
            Audio settings: Global
        </h2>
        <div class="controls-container">
            <div class="controls-group">
                <SEControl
                    v-slot="slotProps"
                    label="Speed"
                    helptext="Set the playing speed."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="speed"
                        :labelledby="slotProps.labelId"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Enable chart play marker"
                    helptext="Show the current play position on the chart."
                    horizontal
                >
                    <SECheckbox
                        :id="slotProps.controlId"
                        v-model="playMarkerEnabled"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    fieldset-legend="Data series order"
                    is-fieldset
                    helptext="Which order to play the data series in, either one after the other, or simultaneously."
                >
                    <SERadioGroup
                        :id="slotProps.controlId"
                        v-model="order"
                        :options="orderOptions"
                    />
                </SEControl>
            </div>

            <h3>Default settings</h3>
            <div class="controls-group">
                <SEControl
                    v-slot="slotProps"
                    label="Min frequency"
                    helptext="The lowest note to play."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="minFreq"
                        :labelledby="slotProps.labelId"
                        :min="60"
                        :max="4200"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Max frequency"
                    helptext="The highest note to play."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="maxFreq"
                        :labelledby="slotProps.labelId"
                        :min="60"
                        :max="4200"
                    />
                </SEControl>
            </div>

            <div class="controls-group">
                <SEControl
                    v-slot="slotProps"
                    label="Enable panning"
                    helptext="Pan the sound to left and right based on x value."
                    horizontal
                >
                    <SECheckbox
                        :id="slotProps.controlId"
                        v-model="panEnabled"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Pan width"
                    helptext="How wide to pan the sound when panning is enabled."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="panWidth"
                        :labelledby="slotProps.labelId"
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
    data() {
        return {
            orderOptions: [{
                label: 'Simultaneous',
                value: 'simultaneous'
            }, {
                label: 'Sequential',
                value: 'sequential'
            }]
        };
    },
    computed: {
        speed: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.playbackOpts.speed; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setSpeed', val); }
        },
        playMarkerEnabled: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.playMarkerEnabled; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPlayMarkerEnabled', val); }
        },
        order: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.playbackOpts.order; },
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
