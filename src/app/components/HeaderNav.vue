<template>
    <nav>
        <ol
            role="tablist"
            aria-label="Select design stage"
        >
            <li
                v-for="tab in headerTabs"
                :key="tab.name"
                role="tab"
                :aria-selected="selectedTab === tab.name ? 'true' : 'false'"
                :aria-controls="tab.controls"
            >
                <HeaderTab
                    :selected="selectedTab === tab.name"
                    @click="tabClicked(tab.name, tab.controls)"
                >
                    {{ tab.name }}
                </HeaderTab>
            </li>
        </ol>
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
    ol {
        display: flex;
        list-style: none;
        height: 100%;
    }
    li:first-child .header-tab {
        border-radius: 4px 0px 0px 4px;
    }
    li:last-child .header-tab {
        border-radius: 0px 4px 4px 0px;
    }
    li {
        display: block;
        flex: 1;
        padding: 1px;
    }
</style>
