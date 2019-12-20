<template>
    <nav>
        <div
            role="tablist"
            class="header-tablist"
            aria-label="Select design stage"
        >
            <HeaderTab
                v-for="tab in headerTabs"
                :key="tab.name"
                role="tab"
                :aria-selected="selectedTab === tab.name ? 'true' : 'false'"
                :aria-controls="tab.controls"
                :selected="selectedTab === tab.name"
                @click="tabClicked(tab.name, tab.controls)"
            >
                {{ tab.name }}
            </HeaderTab>
        </div>
    </nav>
</template>

<script lang="ts">
import HeaderTab from './HeaderTab.vue';

export default {
    components: {
        HeaderTab
    },
    data: function () {
        return {
            headerTabs: [{
                name: 'Data',
                controls: 'dataContent',
            }, {
                name: 'Audio',
                controls: 'mappingsContent',
            }, {
                name: 'Chart',
                controls: 'chartContent',
            }],
            selectedTab: 'Data'
        };
    },
    created: function () {
        this.$emit('tab-selected', 'dataContent');
    },
    methods: {
        tabClicked: function (tabId: string, controlsId: string): void {
            this.selectedTab = tabId;
            this.$emit('tab-selected', controlsId);
        }
    }
};
</script>

<style lang="less" scoped>
    nav {
        width: 100%;
    }
    .header-tablist {
        display: flex;
        height: 100%;
        padding-bottom: 1px;
        box-sizing: border-box;
    }
    .header-tab:first-child {
        border-radius: 4px 0px 0px 4px;
    }
    .header-tab:last-child {
        border-radius: 0px 4px 4px 0px;
    }
    .header-tab {
        display: block;
        flex: 1;
        margin-right: 1px;
    }
</style>
