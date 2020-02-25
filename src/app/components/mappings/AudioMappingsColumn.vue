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
import AudioMappingsColumnScales from './AudioMappingsColumnScales.vue';
import AudioMappingsColumnPan from './AudioMappingsColumnPan.vue';
import AudioMappingsColumnPitch from './AudioMappingsColumnPitch.vue';
import AudioMappingsColumnVolume from './AudioMappingsColumnVolume.vue';

export default {
    components: {
        SEAccordionItem,
        AudioMappingsColumnScales,
        AudioMappingsColumnPan,
        AudioMappingsColumnPitch,
        AudioMappingsColumnVolume
    },
    data: function () {
        return {
            accordionItems: [{
                heading: 'Sound scales',
                component: 'AudioMappingsColumnScales'
            }, {
                heading: 'Pitch',
                component: 'AudioMappingsColumnPitch'
            }, {
                heading: 'Pan (left to right)',
                component: 'AudioMappingsColumnPan',
                selected: true
            }, {
                heading: 'Volume',
                component: 'AudioMappingsColumnVolume'
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
