<template>
    <div>
        <h2>Mappings: Column B</h2>
        <div class="accordion-container">
            <SEAccordionItem
                v-for="item in accordionItems"
                :key="item.component"
                :heading="item.heading"
                :content-id="item.contentId"
                :selected="item.selected"
            >
                <keep-alive>
                    <component
                        :is="item.component"
                        :id="item.contentId"
                    />
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
                component: 'MappingsColumnPan',
                selected: true
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
