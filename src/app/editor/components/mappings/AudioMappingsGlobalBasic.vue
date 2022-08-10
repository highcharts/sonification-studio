<template>
    <div class="audio-global-basic-container">
        <div class="controls-group">
            <SEControl
                v-slot="slotProps"
                :label="`Play Speed (duration ${Math.round(duration / 100) / 10}s)`"
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
                label="Play Detail"
                helptext="Set how many notes are played, from low (1) to high (15) number of notes. When you have a lot of data, multiple points may be combined into a single note depending on this setting. This setting does not affect the playing duration, only how many notes are played."
            >
                <SESlider
                    :id="slotProps.controlId"
                    v-model.number="detail"
                    :labelledby="slotProps.labelId"
                    :min="1"
                    :max="15"
                    :step="0.1"
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
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import { speedToDuration } from '../../core/utils/sonificationTools';

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
        duration() {
            return speedToDuration((this as any).speed);
        },
        speed: {
            get() { return (this as any).$store.state.globalSonifyParametersStore.speed; },
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
            get() { return (this as any).$store.state.globalSonifyParametersStore.order; },
            set(val) { return this.$store.commit('globalSonifyParametersStore/setOrder', val); }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    .controls-container {
        padding: 0 10px;
        margin-bottom: 20px;
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
