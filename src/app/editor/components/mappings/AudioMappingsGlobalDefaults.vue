<template>
    <div class="audio-global-defaults-container">
        <div class="controls-group">
            <SEControl
                v-slot="slotProps"
                label="Default minimum note"
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
                label="Default maximum note"
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
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

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
