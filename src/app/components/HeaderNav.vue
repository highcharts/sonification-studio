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
        tabClicked(tabId: string) {
            this.selectedTab = tabId;
        }
    }
};
</script>

<style lang="less" scoped>
nav {
    width: 100%;
    background-color: gray;
}
ol {
    display: flex;
    list-style: none;
}
li {
    display: block;
}
</style>
