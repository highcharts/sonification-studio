<template>
    <div>
        <h2>Mappings: Column - TODO</h2>
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
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import MappingsColumnScales from './MappingsColumnScales.vue';
import MappingsColumnPan from './MappingsColumnPan.vue';
import MappingsColumnPitch from './MappingsColumnPitch.vue';
import MappingsColumnVolume from './MappingsColumnVolume.vue';

export default {
    components: {
        SEAccordionItem,
        MappingsColumnScales,
        MappingsColumnPan,
        MappingsColumnPitch,
        MappingsColumnVolume
    },
    data: function () {
        return {
            accordionItems: [{
                heading: 'Sound scales',
                component: 'MappingsColumnScales'
            }, {
                heading: 'Pitch',
                component: 'MappingsColumnPitch'
            }, {
                heading: 'Pan (left to right)',
                component: 'MappingsColumnPan',
                selected: true
            }, {
                heading: 'Volume',
                component: 'MappingsColumnVolume'
            }]
        };
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h2 {
        margin: 20px 5px;
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
