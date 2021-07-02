<template>
    <div
        role="tabpanel"
        aria-labelledby="chartmappingsglobal-heading"
    >
        <h4 id="chartmappingsglobal-heading">
            Visual settings: Global
        </h4>
        <SEAccordionContainer>
            <SEAccordionItem
                v-for="item in accordionItems"
                :key="item.heading"
                :heading="item.heading"
                :selected="!!expandedAccordionItems[item.heading]"
                @click="onAccordionItemClick"
            >
                <keep-alive>
                    <component
                        :is="item.component"
                        :axis="item.axis"
                    />
                </keep-alive>
            </SEAccordionItem>
        </SEAccordionContainer>
    </div>
</template>

<script lang="ts">
import SEAccordionContainer from '../basic/SEAccordionContainer.vue';
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import ChartMappingsGlobalBasic from './ChartMappingsGlobalBasic.vue';
import ChartMappingsGlobalAdvanced from './ChartMappingsGlobalAdvanced.vue';
import ChartMappingsGlobalAxis from './ChartMappingsGlobalAxis.vue';

import { mapState } from 'vuex';
import { GenericObject } from '../../core/utils/objects';

export default {
    components: {
        SEAccordionContainer,
        SEAccordionItem,
        ChartMappingsGlobalBasic,
        ChartMappingsGlobalAdvanced,
        ChartMappingsGlobalAxis
    },
    data() {
        return {
            accordionItems: [{
                heading: 'Basic',
                component: 'ChartMappingsGlobalBasic'
            }, {
                heading: 'X-axis',
                component: 'ChartMappingsGlobalAxis',
                axis: 'X'
            }, {
                heading: 'Y-axis',
                component: 'ChartMappingsGlobalAxis',
                axis: 'Y'
            }, {
                heading: 'Advanced',
                component: 'ChartMappingsGlobalAdvanced'
            }]
        };
    },
    computed: mapState({
        expandedAccordionItems: (state: any) => state.viewStore.expandedChartMappingsAccordionItems
    }),
    methods: {
        onAccordionItemClick(e: Event, item: GenericObject, isSelected: boolean) {
            this.$store.commit('viewStore/setExpandedChartMappingsAccordionItem', {
                itemName: item.heading,
                expanded: isSelected
            });
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";
    @import "../../colors";

    h4 {
        margin: 20px 5px 10px;
    }
</style>
