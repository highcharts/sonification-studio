<template>
    <div>
        <h2>Mappings: Column B</h2>
        <div class="accordion-container">
            <SEAccordionItem
                v-for="item in accordionItems"
                :key="item.component"
                :heading="item.heading"
                :content-id="item.contentId"
            >
                <keep-alive>
                    <component :is="item.component" />
                </keep-alive>
            </SEAccordionItem>
        </div>
    </div>
</template>

<script lang="ts">
import SEAccordionItem from './SEAccordionItem.vue';
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
                contentId: 'mapping-scales',
                component: 'MappingsColumnScales'
            }, {
                heading: 'Pitch',
                contentId: 'mapping-pitch',
                component: 'MappingsColumnPitch'
            }, {
                heading: 'Pan (left to right)',
                contentId: 'mapping-pan',
                component: 'MappingsColumnPan'
            }, {
                heading: 'Volume',
                contentId: 'mapping-volume',
                component: 'MappingsColumnVolume'
            }]
        };
    }
};
</script>

<style lang="less" scoped>
    @import "../sidebar";

    .accordion-container {
        width: 100%;
    }

    .se-accordion-item {
        margin: 5px 0;
    }
</style>
