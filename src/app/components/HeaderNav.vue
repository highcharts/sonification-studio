<template>
    <nav>
        <ol
            role="tablist"
            aria-label="Select design stage"
        >
            <li
                v-for="tab in headerTabs"
                :key="tab.name"
            >
                <HeaderTab
                    :selected="selectedTab === tab.name"
                    :controls="tab.controls"
                    @click="tabClicked(tab.name)"
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
                name: 'Mappings',
                controls: 'mappingsContent',
            }, {
                name: 'Customize',
                controls: 'customizeContent',
            }],
            selectedTab: 'Data'
        };
    },
    methods: {
        tabClicked: function (tabId: string) {
            this.selectedTab = tabId;
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
