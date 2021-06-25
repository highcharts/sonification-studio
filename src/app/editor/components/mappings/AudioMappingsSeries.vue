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
                @click="onAccordionItemClick"
            >
                <keep-alive>
                    <component :is="item.component" />
                </keep-alive>
            </SEAccordionItem>
        </SEAccordionContainer>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import SEAccordionContainer from '../basic/SEAccordionContainer.vue';
import AudioMappingsSeriesInstrument from './AudioMappingsSeriesInstrument.vue';
import AudioMappingsSeriesDuration from './AudioMappingsSeriesDuration.vue';
import AudioMappingsSeriesPan from './AudioMappingsSeriesPan.vue';
import AudioMappingsSeriesPitch from './AudioMappingsSeriesPitch.vue';
import AudioMappingsSeriesVolume from './AudioMappingsSeriesVolume.vue';
import { GenericObject } from '../../core/utils/objects';
import { makeSelectedAudioMappingSeriesPropertyMapping } from '../../store/storeUtils';
import { getSeriesId } from '../../core/utils/chartUtils';
import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SEDropdown,
        SEAccordionItem,
        SEAccordionContainer,
        AudioMappingsSeriesInstrument,
        AudioMappingsSeriesDuration,
        AudioMappingsSeriesPan,
        AudioMappingsSeriesPitch,
        AudioMappingsSeriesVolume
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
                heading: 'Duration',
                component: 'AudioMappingsSeriesDuration'
            }]
        };
    },
    computed: {
        ...mapState({
            reactToDataUpdates: (state: any) => state.viewStore.reactToDataUpdates,
            expandedAccordionItems: (state: any) => state.viewStore.expandedSeriesAudioAccordionItems
        }),
        selectedSeries: makeSelectedAudioMappingSeriesPropertyMapping(),
        dataSeries() {
            const chartBridge = (this as any).$chartBridge;
            const series = chartBridge?.reactiveGet('getDataSeries', this.reactToDataUpdates) || [];

            return series.map((s: GenericObject) => ({
                name: s.name,
                value: getSeriesId(s)
            }));
        }
    },
    methods: {
        onAccordionItemClick(e: Event, item: GenericObject, isSelected: boolean) {
            this.$store.commit('viewStore/setExpandedSeriesAudioAccordionItem', {
                itemName: item.heading,
                expanded: isSelected
            });
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h4 {
        margin: 20px 5px 10px;
    }

    .series-selector-container {
        width: 100%;
        padding: 0 10px 20px;
        box-sizing: border-box;
    }
</style>
