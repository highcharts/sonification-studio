<!--
    App component is the root container for the app. It expands to the width and height of
    the element it is placed within. See the "./public" directory for usage.
-->
<template>
    <div class="app-container">
        <Header />
        <MainContentView id="mainContentView" />
        <Footer />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import hcMoreInit from 'highcharts/highcharts-more';
import hcDataInit from 'highcharts/modules/data';
import hcSeriesLabelInit from 'highcharts/modules/series-label';
import hcNoDataInit from 'highcharts/modules/no-data-to-display';
import hcSonificationInit from 'highcharts/modules/sonification';
import hcAccessibilityInit from 'highcharts/modules/accessibility';
hcMoreInit(Highcharts);
hcDataInit(Highcharts);
hcSeriesLabelInit(Highcharts);
hcNoDataInit(Highcharts);
hcSonificationInit(Highcharts);
hcAccessibilityInit(Highcharts);
window.Highcharts = Highcharts; // Expose on window for debugging
Vue.use(HighchartsVue);

import Header from './components/Header.vue';
import MainContentView from './components/MainContentView.vue';
import Footer from './components/Footer.vue';
import { store } from '../store/store';
import { removeFocusOutlineUnlessKeypress } from './removeFocusOutline';

import { ChartBridge } from '../core/ChartBridge';
Vue.prototype.$chartBridge = new ChartBridge(store);

export default {
    store,
    components: {
        Header,
        MainContentView,
        Footer
    },
    mounted: removeFocusOutlineUnlessKeypress
};
</script>

<style lang="less" scoped>
    @import "colors";

    .app-container {
        background-color: @app-bg-color;
        padding: 10px;
        height: 100%;
        width: 100%;
        max-height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    #mainContentView {
        flex: 1;
        margin-top: 4px;
        overflow-y: scroll;
        /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
        padding-left: 100px;
        margin-left: -100px;
    }
</style>
