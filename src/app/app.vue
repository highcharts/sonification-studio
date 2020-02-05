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
import hcDataInit from 'highcharts/modules/data';
import hcNoDataInit from 'highcharts/modules/no-data-to-display';

hcDataInit(Highcharts);
hcNoDataInit(Highcharts);
Vue.use(HighchartsVue);

import context from './context';
Vue.prototype.$seContext = context;

import Header from './components/Header.vue';
import MainContentView from './components/MainContentView.vue';
import Footer from './components/Footer.vue';
import { store } from './store/store';
import { removeFocusOutlineUnlessKeypress } from './removeFocusOutline';

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
        min-width: 850px;
        min-height: 800px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    #mainContentView {
        flex: 1;
        margin-top: 5px;
    }
</style>
