import { createStore, Store } from 'vuex';

import { dataStore } from './modules/data';
import { viewStore } from './modules/view';
import { chartParametersStore } from './modules/chartParameters';
import { seriesParametersStore } from './modules/seriesParameters';
import { globalSonifyParametersStore } from './modules/globalSonifyParameters';
import { GenericObject } from '../core/utils/objects';

// Root state of the store: one entry per store module.
export interface RootState {
    chartParametersStore: GenericObject;
    seriesParametersStore: GenericObject;
    dataStore: GenericObject;
    globalSonifyParametersStore: GenericObject;
    viewStore: GenericObject;
}

// Bump this when making breaking changes to the store API. This will invalidate the
// localStorage cache, and clear old revisions. Will also give user a warning if they
// try to load project files with storage revision older than this.
export const storageRevision = 4;

// Key for localStorage cache
export const storageKey = 'highcharts.sonification.studio.appstate';

let persistTimer: number;

export const store: Store<RootState> = createStore<RootState>({
    modules: {
        chartParametersStore,
        seriesParametersStore,
        dataStore,
        globalSonifyParametersStore,
        viewStore
    },
    plugins: [function persistToLocalStorage (store: Store<RootState>) {
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
