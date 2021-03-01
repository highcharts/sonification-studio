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
                :aria-selected="selectedHeaderTabId === tab.name ? 'true' : 'false'"
                :aria-controls="tab.controls"
                :selected="selectedHeaderTabId === tab.name"
                @click="tabClicked(tab.name, tab.controls)"
            >
                {{ tab.name }}
            </HeaderTab>
        </div>
        <div class="header-spacing" />
        <router-link
            v-slot="{ navigate }"
            class="header-back"
            to="/"
            custom
        >
            <a
                href="#"
                @click="navigate"
                @keydown.space="navigate"
            >
                <img
                    class="back-icon"
                    alt=""
                    :src="backIcon"
                >
                Back
            </a>
        </router-link>
    </nav>
</template>

<script lang="ts">
import HeaderTab from './HeaderTab.vue';
import { mapState } from 'vuex';
import backIcon from '../assets/angle-left-solid.svg';

export default {
    components: {
        HeaderTab
    },
    data() {
        return {
            backIcon,
            headerTabs: [{
                name: 'Data',
                controls: 'dataContent',
            }, {
                name: 'Chart',
                controls: 'mainContentView',
            }]
        };
    },
    computed: mapState('viewStore', ['selectedHeaderTabId']),
    methods: {
        tabClicked: function (tabId: string, controlsId: string): void {
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
    }
    .header-tab:last-child {
        border-radius: 0px 4px 4px 0px;
    }
    .header-tab {
        flex: 1;
        margin-right: 1px;
    }

    .header-spacing {
        flex: 1;
    }

    .header-back {
        margin-right: 7px;
        padding: 3px 15px 3px 5px;
        line-height: 24px;
        vertical-align: middle;
        text-decoration: none;
        color: @dark-gray-5;
        border: 1px solid transparent;
        border-radius: 5px;
        cursor: pointer;
        img {
            width: 24px;
            height: 24px;
            margin-top: -3px;
            margin-right: -4px;
            vertical-align: middle;
        }
        &:visited {
            color: @dark-gray-5;
        }
        &:hover {
            color: @dark-gray-6;
            border: 1px solid @dark-gray-7;
        }
        &:active {
            color: @dark-gray-5;
            border: 1px solid @dark-gray-5;
            background-color: rgba(0, 0, 0, 0.01);
        }
    }
</style>
