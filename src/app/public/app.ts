import Vue from 'vue';
import app from '../app.vue';
import HighchartsVue from 'highcharts-vue';

Vue.use(HighchartsVue);

new Vue(app).$mount('#app');
