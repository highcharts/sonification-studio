<template>
    <div>
        <h2>Audio settings: Data series</h2>
        <div class="series-selector-container">
            <SEControl
                control-id="series-selector"
                label="Series"
                helptext="The data series to apply settings to"
            >
                <SEDropdown
                    id="series-selector"
                    v-model="selectedSeries"
                    :options="dataSeries"
                />
            </SEControl>
        </div>
        <div class="accordion-container">
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
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import AudioMappingsSeriesInstrument from './AudioMappingsSeriesInstrument.vue';
import AudioMappingsSeriesDuration from './AudioMappingsSeriesDuration.vue';
import AudioMappingsSeriesPan from './AudioMappingsSeriesPan.vue';
import AudioMappingsSeriesPitch from './AudioMappingsSeriesPitch.vue';
import AudioMappingsSeriesVolume from './AudioMappingsSeriesVolume.vue';
import { GenericObject } from '../../../core/utils/objects';
import { makeSelectedAudioMappingSeriesPropertyMapping } from '../../../store/storeUtils';
import { getSeriesId } from '../../../core/utils/chartUtils';
import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SEDropdown,
        SEAccordionItem,
        AudioMappingsSeriesInstrument,
        AudioMappingsSeriesDuration,
        AudioMappingsSeriesPan,
        AudioMappingsSeriesPitch,
        AudioMappingsSeriesVolume
    },
    data: function () {
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
        dataSeries: function () {
            const chartBridge = (this as any).$chartBridge;
            const series = chartBridge?.reactiveGet('getDataSeries', this.reactToDataUpdates) || [];

            return series.map((s: GenericObject) => ({
                name: s.name,
                value: getSeriesId(s)
            }));
        }
    },
    methods: {
        onAccordionItemClick: function (e: Event, item: GenericObject, isSelected: boolean) {
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

    h2 {
        margin: 20px 5px;
    }

    .series-selector-container {
        width: 100%;
        padding: 0 10px 20px;
        box-sizing: border-box;
    }

    .accordion-container {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid @accordion-container-border;
        border-radius: 8px;
    }

    .se-accordion-item:not(:last-child) {
        margin-bottom: 3px;
    }
</style>
