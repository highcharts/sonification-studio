<template>
    <div>
        <h2>Audio settings</h2>
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
                :selected="item.selected"
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
import AudioMappingsSeriesScales from './AudioMappingsSeriesScales.vue';
import AudioMappingsSeriesPan from './AudioMappingsSeriesPan.vue';
import AudioMappingsSeriesPitch from './AudioMappingsSeriesPitch.vue';
import AudioMappingsSeriesVolume from './AudioMappingsSeriesVolume.vue';
import { GenericObject } from '../../../core/utils/objects';
import { getSeriesId } from '../../../core/utils/chartUtils';
import { mapState } from 'vuex';

export default {
    components: {
        SEControl,
        SEDropdown,
        SEAccordionItem,
        AudioMappingsSeriesScales,
        AudioMappingsSeriesPan,
        AudioMappingsSeriesPitch,
        AudioMappingsSeriesVolume
    },
    data: function () {
        return {
            accordionItems: [{
                heading: 'Sound scales',
                component: 'AudioMappingsSeriesScales'
            }, {
                heading: 'Pitch',
                component: 'AudioMappingsSeriesPitch'
            }, {
                heading: 'Pan (left to right)',
                component: 'AudioMappingsSeriesPan',
                selected: true
            }, {
                heading: 'Volume',
                component: 'AudioMappingsSeriesVolume'
            }]
        };
    },
    computed: {
        ...mapState({
            reactToDataUpdates: (state: any) => state.viewStore.reactToDataUpdates
        }),
        selectedSeries: {
            get() { return (this as any).$store.state.viewStore.selectedDataSeriesAudioMapping; },
            set(val) { return (this as any).$store.commit('viewStore/setSelectedDataSeriesAudioMapping', val); }
        },
        dataSeries: function () {
            const chartBridge = (this as any).$chartBridge;
            const series = chartBridge?.reactiveGet('getDataSeries', this.reactToDataUpdates) || [];

            return series.map((s: GenericObject) => ({
                name: s.name,
                value: getSeriesId(s)
            }));
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h2 {
        margin: 15px 5px;
    }

    .series-selector-container {
        width: 100%;
        padding: 0 10px 20px;
        box-sizing: border-box;
    }

    .accordion-container {
        width: 100%;
        border: 1px solid @accordion-container-border;
        border-radius: 8px;
    }

    .se-accordion-item:not(:last-child) {
        margin-bottom: 3px;
    }
</style>
