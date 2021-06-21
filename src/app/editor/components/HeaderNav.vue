<template>
    <nav>
        {{ /* Use button element because of potential vue-router issue with #-links */ }}
        <button
            role="link"
            class="skip-link"
            @click="onSkipLinkClick"
            @keydown.enter="onSkipLinkClick"
            @keydown.space="onSkipLinkClick"
        >
            Skip to content
        </button>

        <SEButton
            ref="helpBtn"
            class="help-btn"
            dark
            :aria-expanded="helpVisible"
            @click="onHelpClick"
        >
            Help
        </SEButton>

        <SEModalInfo
            v-show="helpVisible"
            ref="helpDialog"
            dialog-title="Help"
            @close="hideHelpDialog"
        >
            <HelpContent />
        </SEModalInfo>

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
import HelpContent from './HelpContent.vue';
import SETablist from './basic/SETablist.vue';
import SEModalInfo from './basic/SEModalInfo.vue';
import SEButton from './basic/SEButton.vue';
import { mapState } from 'vuex';
import backIcon from '../assets/angle-left-solid.svg';

export default {
    components: {
        SETablist, HeaderTab, HelpContent, SEModalInfo, SEButton
    },
    data() {
        return {
            backIcon,
            helpVisible: false,
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
    mounted() {
        document.addEventListener('keydown', e => {
            const keyCode = e.which || e.keyCode;
            if (keyCode === 27 && this.helpVisible) { // esc
                this.hideHelpDialog();
            }
        });
    },
    methods: {
        hideHelpDialog() {
            this.helpVisible = false;
            this.$nextTick(() => (this.$refs['helpBtn'] as any).$el.focus());
        },
        tabClicked(tabId: string, controlsId: string): void {
            this.$store.commit('viewStore/selectHeaderTab', {
                selectedTabId: tabId,
                contentId: controlsId
            });

            // Make sure we recalculate speed when data has changed
            this.$store.commit('globalSonifyParametersStore/triggerPlaybackOptsRecalculation');
            (this as any).$chartBridge.reflowChart();
        },
        onHelpClick() {
            this.helpVisible = !this.helpVisible;
            if (this.helpVisible) {
                this.$nextTick(() => (this.$refs.helpDialog as any).$el.focus());
            } else {
                this.hideHelpDialog();
            }
        },
        onSkipLinkClick(e: Event) {
            this.$emit('skipToContent');
            e.preventDefault();
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

    .skip-link {
        position: absolute;
        opacity: 0.000001;
        z-index: -99;
        width: 1px;
        height: 1px;
        filter: alpha(opacity=1);
        overflow: hidden;
        white-space: nowrap;
        clip: rect(1px, 1px, 1px, 1px);
        background-color: #fff;
        padding: 10px;
        border: 1px solid @dark-blue-5;
        border-radius: 3px;
        color: #c40707;
        &:focus, &:active {
            z-index: 100;
            width: auto;
            height: auto;
            left: 8px;
            top: 8px;
            opacity: 1;
            clip: auto;
            filter: none;
        }
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
        margin-right: 5px;
        padding: 3px 13px 3px 3px;
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

    .help-btn {
        margin-top: 4px;
        margin-bottom: 6px;
        order: 4;
    }

</style>
