<template>
    <div
        role="tabpanel"
        aria-labelledby="audiomappingsglobal-heading"
    >
        <h4 id="audiomappingsglobal-heading">
            Audio settings: Global
        </h4>
        <div class="controls-container">
            <div class="controls-group">
                <SEControl
                    v-slot="slotProps"
                    :label="`Speed (duration ${Math.round(duration / 100) / 10}s)`"
                    helptext="Set the playing speed from 1 to 100."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="speed"
                        :labelledby="slotProps.labelId"
                        :min="1"
                        :step="0.1"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Detail"
                    helptext="Set how many notes are played, from low (1) to high (15) number of notes. When you have a lot of data, multiple points may be combined into a single note depending on this setting. This setting does not affect the playing duration, only how many notes are played."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="detail"
                        :labelledby="slotProps.labelId"
                        :min="1"
                        :max="15"
                        :step="1"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Enable chart play marker"
                    helptext="Visually show the current play position on the chart with a moving crosshair."
                    horizontal
                >
                    <SECheckbox
                        :id="slotProps.controlId"
                        v-model="playMarkerEnabled"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Show tooltip on play"
                    helptext="Highlight the current point with a tooltip while playing."
                    horizontal
                >
                    <SECheckbox
                        :id="slotProps.controlId"
                        v-model="tooltipMarkerEnabled"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    fieldset-legend="Data series order"
                    is-fieldset
                    compact-content
                    helptext="Which order to play the data series in, either one after the other (sequentially), or at the same time (simultaneously)."
                >
                    <SERadioGroup
                        :id="slotProps.controlId"
                        v-model="order"
                        :options="orderOptions"
                    />
                </SEControl>
            </div>

            <h5>Default settings</h5>
            <div class="controls-group">
                <SEControl
                    v-slot="slotProps"
                    label="Min note"
                    helptext="The lowest note to play, given as number of notes from the lowest C (C0)."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="minNote"
                        :labelledby="slotProps.labelId"
                        :min="0"
                        :max="110"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Max note"
                    helptext="The highest note to play, given as number of notes from the lowest C (C0)."
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="maxNote"
                        :labelledby="slotProps.labelId"
                        :min="0"
                        :max="110"
                    />
                </SEControl>
            </div>

            <div class="controls-group">
                <SEControl
                    v-slot="slotProps"
                    label="Default panning enabled"
                    helptext="Pan the sound to left and right based on x value by default. Panning behavior can be overridden for each data series."
                    horizontal
                >
                    <SECheckbox
                        :id="slotProps.controlId"
                        v-model="panEnabled"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Default pan width"
                    helptext="How wide to pan the sound when default panning is enabled, from narrow (0) to wide (100). Pan width and placement can be overridden for each data series."
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
import { mapGetters } from 'vuex';

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
        detail: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.detail; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setDetail', val); }
        },
        playMarkerEnabled: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.playMarkerEnabled; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPlayMarkerEnabled', val); }
        },
        tooltipMarkerEnabled: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.tooltipMarkerEnabled; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setTooltipMarkerEnabled', val); }
        },
        order: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.playbackOpts.order; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setOrder', val); }
        },
        minNote: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.minNote; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setMinNote', val); }
        },
        maxNote: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.maxNote; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setMaxNote', val); }
        },
        panEnabled: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.panEnabled; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPanEnabled', val); }
        },
        panWidth: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.panWidth; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setPanWidth', val); }
        },
        ...mapGetters('globalSonifyParametersStore', ['duration'])
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h4 {
        margin: 10px 5px 10px;
    }

    h5 {
        margin: 25px 0 0;
    }

    .controls-container {
        padding: 0 10px;
    }

    .se-control {
        margin: 20px 0;
    }

    .controls-group {
        margin: 20px 0;
        &:first-child {
            margin-top: 0;
            .se-control:first-child {
                margin-top: 0;
            }
        }
        &:last-child {
            margin-bottom: 0;
            .se-control:last-child {
                margin-bottom: 0;
            }
        }
    }
</style>
