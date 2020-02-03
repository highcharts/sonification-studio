import Vue from 'vue';
import app from '../app.vue';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import hcDataInit from 'highcharts/modules/data';

hcDataInit(Highcharts);
Vue.use(HighchartsVue);

new Vue(app).$mount('#app');
