<template>
    <nav aria-label="Editor">
        <SETablist
            class="header-tablist"
            aria-label="Design stage"
        >
            <HeaderTab
                v-for="tab in headerTabs"
                :key="tab.name"
                role="tab"
                :aria-selected="selectedHeaderTabId === tab.name ? 'true' : 'false'"
                :aria-controls="tab.controls"
                :selected="selectedHeaderTabId === tab.name"
                @click="tabClicked(tab.name, tab.controls)"
            >
                {{ tab.name }}
            </HeaderTab>
        </SETablist>
    </nav>
</template>

<script lang="ts">
import HeaderTab from './HeaderTab.vue';
import SETablist from './basic/SETablist.vue';
import { mapState } from 'vuex';

export default {
    components: {
        SETablist, HeaderTab
    },
    data() {
        return {
            headerTabs: [{
                name: 'Data',
                controls: 'dataContent',
            }, {
                name: 'Chart',
                controls: 'chartContent',
            }]
        };
    },
    computed: mapState('viewStore', ['selectedHeaderTabId']),
    methods: {
        tabClicked(tabId: string, controlsId: string): void {
            this.$store.commit('viewStore/selectHeaderTab', {
                selectedTabId: tabId,
                contentId: controlsId
            });

            // Make sure we recalculate speed when data has changed
            this.$store.commit('globalSonifyParametersStore/triggerPlaybackOptsRecalculation');
            (this as any).$chartBridge.reflowChart();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    nav {
        width: 100%;
        display: flex;
        align-items: center;
    }

    .header-tablist {
        flex: 1;
        max-width: 600px;
        display: flex;
        height: 100%;
        padding-bottom: 1px;
        box-sizing: border-box;
    }
    .header-tab:first-child {
        border-radius: 4px 0px 0px 4px;
        &:not(.selected) {
            border-bottom-left-radius: 1px;
        }
    }
    .header-tab:last-child {
        border-radius: 0px 4px 4px 0px;
        &:not(.selected) {
            border-bottom-right-radius: 1px;
        }
    }
    .header-tab {
        flex: 1;
    }

</style>
