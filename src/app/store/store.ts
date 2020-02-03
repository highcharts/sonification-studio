import Vue from 'vue';
import Vuex from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        dataStore,
        viewStore
    }
});
