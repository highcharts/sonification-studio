<!--
    Editor component is the root container for the app. See the "./public" directory for usage.
-->
<template>
    <div class="editor-container">
        <Header @skipToContent="onSkipToContent" />
        <MainContentView
            id="mainContentView"
            ref="mainContentView"
        />
        <Footer />
        <div ref="announcePolite" />
        <div ref="announceAssertive" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/stock';
import 'highcharts/modules/data';
import 'highcharts/modules/exporting';
import 'highcharts/modules/offline-exporting';
import 'highcharts/modules/series-label';
import 'highcharts/modules/no-data-to-display';
import 'highcharts/modules/sonification';
import 'highcharts/modules/accessibility';
import 'highcharts/themes/high-contrast-light';
import { negativeLogPlugin } from './core/utils/chartUtils';
negativeLogPlugin(Highcharts);

//window.Highcharts = Highcharts; // Expose on window for debugging
Vue.use(HighchartsVue);

import Header from './components/Header.vue';
import MainContentView from './components/MainContentView.vue';
import Footer from './components/Footer.vue';
import Announcer from './core/utils/Announcer';
import { store, storageKey, storageRevision } from './store/store';
import { ChartBridge } from './core/ChartBridge';

Vue.prototype.$chartBridge = new ChartBridge(store, Highcharts);
const announcer = (Vue.prototype.$announcer = new Announcer());
Vue.prototype.$chartBridge.initAnnouncer(announcer);

export default {
    store,
    components: {
        Header,
        MainContentView,
        Footer,
    },
    mounted() {
        announcer.init(
            this.$refs.announcePolite as HTMLElement,
            this.$refs.announceAssertive as HTMLElement
        );
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
                this.$nextTick(() => {
                    const rowData = this.$store.state.dataStore.tableRowData;
                    this.$store.commit(
                        'dataStore/setTableCSV',
                        rowData.map((row) => Object.values(row).join(';')).join('\n')
                    );
                    this.$store.commit('viewStore/triggerDataReactivity');
                });
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
        },
    },
};
</script>

<style lang="less" scoped>
@import 'colors';

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
