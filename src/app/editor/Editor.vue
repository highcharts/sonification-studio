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
        <div ref="announcePolite" />
        <div ref="announceAssertive" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/highcharts-more.src';
import 'highcharts/es-modules/masters/modules/stock.src';
import 'highcharts/es-modules/masters/modules/data.src';
import 'highcharts/es-modules/masters/modules/exporting.src';
import 'highcharts/es-modules/masters/modules/offline-exporting.src';
import 'highcharts/es-modules/masters/modules/series-label.src';
import 'highcharts/es-modules/masters/modules/no-data-to-display.src';
import 'highcharts/es-modules/masters/modules/sonification.src';
import 'highcharts/es-modules/masters/modules/accessibility.src';
import 'highcharts/es-modules/masters/themes/high-contrast-light.src';
import { negativeLogPlugin } from './core/utils/chartUtils';
negativeLogPlugin(Highcharts);
window.Highcharts = Highcharts; // Expose on window for debugging
Vue.use(HighchartsVue);

import Header from './components/Header.vue';
import MainContentView from './components/MainContentView.vue';
import Footer from './components/Footer.vue';
import Announcer from './core/utils/Announcer';
import { store, storageKey, storageRevision } from './store/store';
import { ChartBridge } from './core/ChartBridge';

let boundaryInstr: Highcharts.Sonification.SonificationInstrument;
Highcharts.Chart.prototype.playBoundaryHit = function(next: boolean) {
    const ax = this.sonification?.audioContext;
    if (ax) {
        if (!boundaryInstr) {
            boundaryInstr = new Highcharts.sonification.SonificationInstrument(
                ax, ax.destination, { synthPatch: 'step' });
        }
        boundaryInstr.scheduleEventAtTime(0, {
            note: 20,
            pan: next ? 1 : -1,
            noteDuration: 200
        });
    }
};

Vue.prototype.$chartBridge = new ChartBridge(store, Highcharts);
const announcer = Vue.prototype.$announcer = new Announcer();
Vue.prototype.$chartBridge.initAnnouncer(announcer);

export default {
    store,
    components: {
        Header,
        MainContentView,
        Footer
    },
    mounted() {
        announcer.init(this.$refs.announcePolite as HTMLElement, this.$refs.announceAssertive as HTMLElement);
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
