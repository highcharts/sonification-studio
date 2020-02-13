import Vue from 'vue';
import Vuex from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';
import { sonifyParametersStore } from './modules/sonifyParameters';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        dataStore,
        sonifyParametersStore,
        viewStore
    }
});
