<template>
    <div
        role="tabpanel"
        aria-labelledby="audiomappingsseries-heading"
    >
        <h4 id="audiomappingsseries-heading">
            Audio settings: Data series
        </h4>
        <div class="series-selector-container">
            <SEControl
                v-slot="slotProps"
                label="Series"
                helptext="The data series to apply settings to"
            >
                <SEDropdown
                    :id="slotProps.controlId"
                    v-model="selectedSeries"
                    :options="dataSeries"
                />
            </SEControl>
        </div>
        <SEAccordionContainer>
            <SEAccordionItem
                v-for="item in accordionItems"
                :key="item.component"
                :heading="item.heading"
                :selected="!!expandedAccordionItems[item.heading]"
                :controls="item.component"
                @click="onAccordionItemClick"
            >
                <keep-alive>
                    <component
                        :is="item.component"
                        :id="item.component"
                    />
                </keep-alive>
            </SEAccordionItem>
        </SEAccordionContainer>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import SEAccordionContainer from '../basic/SEAccordionContainer.vue';
import AudioMappingsSeriesInstrument from './AudioMappingsSeriesInstrument.vue';
import AudioMappingsSeriesDuration from './AudioMappingsSeriesDuration.vue';
import AudioMappingsSeriesPan from './AudioMappingsSeriesPan.vue';
import AudioMappingsSeriesPitch from './AudioMappingsSeriesPitch.vue';
import AudioMappingsSeriesVolume from './AudioMappingsSeriesVolume.vue';
import AudioMappingsSeriesLowpass from './AudioMappingsSeriesLowpass.vue';
import AudioMappingsSeriesHighpass from './AudioMappingsSeriesHighpass.vue';
import AudioMappingsSeriesTremoloDepth from './AudioMappingsSeriesTremoloDepth.vue';
import AudioMappingsSeriesTremoloSpeed from './AudioMappingsSeriesTremoloSpeed.vue';
import type { GenericObject } from '../../core/utils/objects';
import { getSeriesId } from '../../core/utils/chartUtils';
import { unescapeHTML } from '../../core/utils/htmlText';
import { mapState, mapStores } from 'pinia';
import { useViewStore } from '../../store/modules/view';

export default defineComponent({
    components: {
        SEControl,
        SEDropdown,
        SEAccordionItem,
        SEAccordionContainer,
        AudioMappingsSeriesInstrument,
        AudioMappingsSeriesDuration,
        AudioMappingsSeriesPan,
        AudioMappingsSeriesPitch,
        AudioMappingsSeriesVolume,
        AudioMappingsSeriesLowpass,
        AudioMappingsSeriesHighpass,
        AudioMappingsSeriesTremoloDepth,
        AudioMappingsSeriesTremoloSpeed
    },
    data() {
        return {
            accordionItems: [{
                heading: 'Instrument',
                component: 'AudioMappingsSeriesInstrument'
            }, {
                heading: 'Pitch',
                component: 'AudioMappingsSeriesPitch'
            }, {
                heading: 'Pan',
                component: 'AudioMappingsSeriesPan'
            }, {
                heading: 'Volume',
                component: 'AudioMappingsSeriesVolume'
            }, {
                heading: 'Note duration',
                component: 'AudioMappingsSeriesDuration'
            }, {
                heading: 'Lowpass filter',
                component: 'AudioMappingsSeriesLowpass'
            }, {
                heading: 'Highpass filter',
                component: 'AudioMappingsSeriesHighpass'
            }, {
                heading: 'Tremolo depth',
                component: 'AudioMappingsSeriesTremoloDepth'
            }, {
                heading: 'Tremolo speed',
                component: 'AudioMappingsSeriesTremoloSpeed'
            }]
        };
    },
    computed: {
        ...mapStores(useViewStore),
        ...mapState(useViewStore, {
            reactToDataUpdates: 'reactToDataUpdates',
            expandedAccordionItems: 'expandedSeriesAudioAccordionItems'
        }),
        selectedSeries: {
            get(): string { return this.viewStore.selectedDataSeriesAudioMapping; },
            set(val: string) { this.viewStore.setSelectedDataSeriesAudioMapping(val); }
        },
        dataSeries(): Array<{ name: string; value: string }> {
            const chartBridge = this.$chartBridge;
            const series = chartBridge?.reactiveGet('getDataSeries', this.reactToDataUpdates) || [];

            return series.map((s: GenericObject) => ({
                // Escaped for the chart (see ChartBridge)
                name: unescapeHTML(s.name),
                value: getSeriesId(s)
            }));
        }
    },
    methods: {
        onAccordionItemClick(e: Event, item: GenericObject, isSelected: boolean) {
            this.viewStore.setExpandedSeriesAudioAccordionItem({
                itemName: item.heading,
                expanded: isSelected
            });
        }
    }
});
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h4 {
        margin: 10px 5px 10px;
    }

    .series-selector-container {
        width: 100%;
        padding: 0 10px 20px;
        box-sizing: border-box;
    }
</style>
