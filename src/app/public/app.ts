import Vue from 'vue';
import app from '../app.vue';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import hcDataInit from 'highcharts/modules/data';
import hcNoDataInit from 'highcharts/modules/no-data-to-display';

hcDataInit(Highcharts);
hcNoDataInit(Highcharts);
Vue.use(HighchartsVue);

new Vue(app).$mount('#app');
