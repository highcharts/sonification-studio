import Vue from 'vue';
import Vuex from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';
import { chartParametersStore } from './modules/chartParameters';
import { seriesParametersStore } from './modules/seriesParameters';
import { globalSonifyParametersStore } from './modules/globalSonifyParameters';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        chartParametersStore,
        seriesParametersStore,
        dataStore,
        globalSonifyParametersStore,
        viewStore
    }
});
