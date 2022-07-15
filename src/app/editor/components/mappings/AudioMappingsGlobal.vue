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

        <SEAccordionContainer>
            <SEAccordionItem
                heading="Default audio settings"
                :selected="expandedGlobalAudioDefaultsAccordionItem"
                controls="audio-global-defaults"
                @click="onDefaultsAccordionClick"
            >
                <keep-alive>
                    <AudioMappingsGlobalDefaults id="audio-global-defaults" />
                </keep-alive>
            </SEAccordionItem>
            <SEAccordionItem
                heading="Global audio contexts"
                :selected="expandedGlobalAudioContextsAccordionItem"
                controls="audio-global-contexts"
                @click="onContextsAccordionClick"
            >
                <keep-alive>
                    <AudioMappingsGlobalContexts
                        id="audio-global-contexts"
                        :variable-value-prop="false"
                    />
                </keep-alive>
            </SEAccordionItem>
        </SEAccordionContainer>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SECheckbox from '../basic/SECheckbox.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import SEAccordionContainer from '../basic/SEAccordionContainer.vue';
import AudioMappingsGlobalDefaults from './AudioMappingsGlobalDefaults.vue';
import AudioMappingsGlobalContexts from './AudioMappingsGlobalContexts.vue';
import { speedToDuration } from '../../core/utils/sonificationTools';
import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SESlider,
        SECheckbox,
        SERadioGroup,
        SEAccordionContainer,
        AudioMappingsGlobalContexts,
        AudioMappingsGlobalDefaults,
        SEAccordionItem
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
        },
        ...mapState('viewStore', ['expandedGlobalAudioDefaultsAccordionItem', 'expandedGlobalAudioContextsAccordionItem']),
    },
    methods: {
        onDefaultsAccordionClick(e: Event, item: unknown, isSelected: boolean) {
            this.$store.commit('viewStore/setExpandedGlobalAudioDefaultsAccordionItem', isSelected);
        },
        onContextsAccordionClick(e: Event, item: unknown, isSelected: boolean) {
            this.$store.commit('viewStore/setExpandedGlobalAudioContextsAccordionItem', isSelected);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h4 {
        margin: 10px 5px 10px;
    }

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
