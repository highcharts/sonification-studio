import Vue from 'vue';
import Vuex from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';
import { chartParametersStore } from './modules/chartParameters';
import { seriesParametersStore } from './modules/seriesParameters';
import { globalSonifyParametersStore } from './modules/globalSonifyParameters';

Vue.use(Vuex);

// Bump this when making breaking changes to the store API. This will invalidate the
// localStorage cache, and clear old revisions.
export const storageRevision = 1;

// Key for localStorage cache
export const storageKey = 'highcharts.sonification.studio.appstate';

let persistTimer: number;

export const store = new Vuex.Store({
    modules: {
        chartParametersStore,
        seriesParametersStore,
        dataStore,
        globalSonifyParametersStore,
        viewStore
    },
    plugins: [function persistToLocalStorage (store) {
        store.subscribe((mutation, state) => {
            if (mutation.type.indexOf('viewStore') < 0) {
                clearTimeout(persistTimer);
                persistTimer = setTimeout(() => {
                    const stateJSON = JSON.stringify(state);
                    try {
                        window.localStorage.setItem(storageKey + '-' + storageRevision, stateJSON);
                    } catch (e) {
                        console.error('Error attempting to store app state:', e);
                    }
                }, 2000);
            }
        });
    }]
});
