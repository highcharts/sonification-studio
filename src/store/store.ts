import Vue from 'vue';
import Vuex from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';
import { chartParametersStore } from './modules/chartParameters';
import { seriesParametersStore } from './modules/seriesParameters';
import { sonifyParametersStore } from './modules/sonifyParameters';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        chartParametersStore,
        seriesParametersStore,
        dataStore,
        sonifyParametersStore,
        viewStore
    }
});
