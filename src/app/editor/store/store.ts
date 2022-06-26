import Vue from 'vue';
import Vuex from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';
import { chartParametersStore } from './modules/chartParameters';
import { seriesParametersStore } from './modules/seriesParameters';
import { globalSonifyParametersStore } from './modules/globalSonifyParameters';
import { GenericObject } from '../core/utils/objects';

Vue.use(Vuex);

// Bump this when making breaking changes to the store API. This will invalidate the
// localStorage cache, and clear old revisions.
// Note: Will not as of yet affect loading old project files.
export const storageRevision = 3;

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
    }],
    actions: {
        // Restore state of stores to match a new state, for loading project files or restoring localStorage sessions.
        // If a new state is not provided, the state is restored to the default state.
        restoreState(_, newState?: GenericObject) {
            this.commit('chartParametersStore/restoreStoreState', newState?.chartParametersStore);
            this.commit('globalSonifyParametersStore/restoreStoreState', newState?.globalSonifyParametersStore);
            this.commit('dataStore/restoreStoreState', newState?.dataStore);
            this.commit('seriesParametersStore/restoreStoreState', newState?.seriesParametersStore);
        }
    }
});
