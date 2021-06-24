<!--
    Editor component is the root container for the app. See the "./public" directory for usage.
-->
<template>
    <div class="editor-container">
        <Header
            @skipToContent="onSkipToContent"
        />
        <MainContentView
            id="mainContentView"
            ref="mainContentView"
        />
        <Footer />
        <div ref="announce" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import hcMoreInit from 'highcharts/highcharts-more';
import hcStockInit from 'highcharts/modules/stock';
import hcDataInit from 'highcharts/modules/data';
import hcExportingInit from 'highcharts/modules/exporting';
import hcOfflineExportingInit from 'highcharts/modules/offline-exporting';
import hcSeriesLabelInit from 'highcharts/modules/series-label';
import hcNoDataInit from 'highcharts/modules/no-data-to-display';
import hcSonificationInit from 'highcharts/modules/sonification';
import hcAccessibilityInit from 'highcharts/modules/accessibility';
import hcThemeInit from 'highcharts/themes/high-contrast-light';
hcThemeInit(Highcharts);
hcMoreInit(Highcharts);
hcStockInit(Highcharts);
hcDataInit(Highcharts);
hcExportingInit(Highcharts);
hcOfflineExportingInit(Highcharts);
hcSeriesLabelInit(Highcharts);
hcNoDataInit(Highcharts);
hcSonificationInit(Highcharts);
hcAccessibilityInit(Highcharts);
window.Highcharts = Highcharts; // Expose on window for debugging
Vue.use(HighchartsVue);

import Header from './components/Header.vue';
import MainContentView from './components/MainContentView.vue';
import Footer from './components/Footer.vue';
import Announcer from './core/utils/Announcer';
import { store, storageKey, storageRevision } from './store/store';
import { removeFocusOutlineUnlessKeypress } from './removeFocusOutline';
import { ChartBridge } from './core/ChartBridge';

Vue.prototype.$chartBridge = new ChartBridge(store, Highcharts);
const announcer = Vue.prototype.$announcer = new Announcer();

export default {
    store,
    components: {
        Header,
        MainContentView,
        Footer
    },
    mounted() {
        removeFocusOutlineUnlessKeypress();
        announcer.init(this.$refs.announce as HTMLElement);
        document.title = 'Editor | Highcharts Sonification Studio';
        this.initStore();
    },
    methods: {
        initStore() {
            this.clearOldStorageRevisions();
            const stateJSON = window.localStorage.getItem(storageKey + '-' + storageRevision);
            const isDev = Vue.config.devtools;

            if (isDev) {
                console.log('Development mode: Skipped loading local storage app state.');
            }

            if (!isDev && stateJSON) {
                const restoredState = JSON.parse(stateJSON);
                this.$store.dispatch('restoreState', restoredState);
            } else {
                this.$store.commit('dataStore/setToPlaceholderData');
            }
        },

        clearOldStorageRevisions() {
            let i = storageRevision;
            while (i--) {
                window.localStorage.removeItem(storageKey + '-' + i);
            }
        },

        onSkipToContent() {
            (this.$refs.mainContentView as any).skipToContent();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "colors";

    .editor-container {
        width: 100%;
        min-width: 850px;
        height: 100%;
        min-height: 750px;
        max-height: 100%;
        margin: 0 auto;
        background-color: @app-bg-color;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    #mainContentView {
        flex: 1;
        margin-top: 4px;
        overflow-y: auto;
        /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
        padding-left: 110px;
        margin-left: -100px;
    }
</style>
