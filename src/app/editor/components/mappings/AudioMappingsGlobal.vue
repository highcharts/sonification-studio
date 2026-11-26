<template>
    <div
        role="tabpanel"
        aria-labelledby="audiomappingsglobal-heading"
    >
        <h4 id="audiomappingsglobal-heading">
            Audio settings: Global
        </h4>
        <SEAccordionContainer>
            <SEAccordionItem
                heading="Basic"
                :selected="expandedGlobalAudioBasicAccordionItem"
                controls="audio-global-basic"
                @click="onBasicAccordionClick"
            >
                <keep-alive>
                    <AudioMappingsGlobalBasic id="audio-global-basic" />
                </keep-alive>
            </SEAccordionItem>
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
                heading="Global audio context cues"
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
import { defineComponent } from 'vue';
import SEAccordionItem from '../basic/SEAccordionItem.vue';
import SEAccordionContainer from '../basic/SEAccordionContainer.vue';
import AudioMappingsGlobalBasic from './AudioMappingsGlobalBasic.vue';
import AudioMappingsGlobalDefaults from './AudioMappingsGlobalDefaults.vue';
import AudioMappingsGlobalContexts from './AudioMappingsGlobalContexts.vue';
import { mapState, mapStores } from 'pinia';
import { useViewStore } from '../../store/modules/view';

export default defineComponent({
    components: {
        SEAccordionContainer,
        AudioMappingsGlobalBasic,
        AudioMappingsGlobalContexts,
        AudioMappingsGlobalDefaults,
        SEAccordionItem
    },
    computed: {
        ...mapStores(useViewStore),
        ...mapState(useViewStore, [
            'expandedGlobalAudioBasicAccordionItem',
            'expandedGlobalAudioDefaultsAccordionItem',
            'expandedGlobalAudioContextsAccordionItem'
        ])
    },
    methods: {
        onBasicAccordionClick(e: Event, item: unknown, isSelected: boolean) {
            this.viewStore.setExpandedGlobalAudioBasicAccordionItem(isSelected);
        },
        onDefaultsAccordionClick(e: Event, item: unknown, isSelected: boolean) {
            this.viewStore.setExpandedGlobalAudioDefaultsAccordionItem(isSelected);
        },
        onContextsAccordionClick(e: Event, item: unknown, isSelected: boolean) {
            this.viewStore.setExpandedGlobalAudioContextsAccordionItem(isSelected);
        }
    }
});
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h4 {
        margin: 10px 5px 10px;
    }
</style>
