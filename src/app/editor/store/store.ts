/*
    App state: the state of all stores together, as saved to project files
    and localStorage sessions, and restored from them.
 */

import type { Pinia } from 'pinia';
import { useChartParametersStore, type ChartParametersState } from './modules/chartParameters';
import { useSeriesParametersStore, type SeriesParametersState } from './modules/seriesParameters';
import { useDataStore, type DataRestoreState, type DataState } from './modules/data';
import { useGlobalSonifyParametersStore, type GlobalSonifyParametersState } from './modules/globalSonifyParameters';
import { useViewStore, type ViewState } from './modules/view';

// State of all stores, keyed by the names of the former Vuex modules. This is
// the serialized format of project files and localStorage sessions: keep the
// keys and their order.
export interface AppState {
    chartParametersStore: ChartParametersState;
    seriesParametersStore: SeriesParametersState;
    dataStore: DataState;
    globalSonifyParametersStore: GlobalSonifyParametersState;
    viewStore: ViewState;
}

// Bump this when making breaking changes to the store API. This will invalidate the
// localStorage cache, and clear old revisions. Will also give user a warning if they
// try to load project files with storage revision older than this.
export const storageRevision = 4;

// Key for localStorage cache
export const storageKey = 'highcharts.sonification.studio.appstate';

// Debounce for saving the app state to localStorage
const persistDelayMs = 2000;

/**
 * Get the state of all stores. The store states are returned as is (not
 * copied), serialize them right away.
 */
export function getAppState(pinia?: Pinia): AppState {
    return {
        chartParametersStore: useChartParametersStore(pinia).$state,
        seriesParametersStore: useSeriesParametersStore(pinia).$state,
        dataStore: useDataStore(pinia).$state,
        globalSonifyParametersStore: useGlobalSonifyParametersStore(pinia).$state,
        viewStore: useViewStore(pinia).$state
    };
}

// A state to restore: a localStorage session's, or a project file's, which has
// no Google API key
export type RestoreAppState = Partial<Omit<AppState, 'dataStore'>> & {
    dataStore?: DataRestoreState;
};

/**
 * Restore state of stores to match a new state, for loading project files or
 * restoring localStorage sessions. If a new state is not provided, the state is
 * restored to the default state (New Project), except for the Google API key.
 * The view store is not restored.
 */
export function restoreAppState(newState?: RestoreAppState, pinia?: Pinia): void {
    useChartParametersStore(pinia).restoreStoreState(newState?.chartParametersStore);
    useGlobalSonifyParametersStore(pinia).restoreStoreState(newState?.globalSonifyParametersStore);
    useDataStore(pinia).restoreStoreState(newState?.dataStore);
    useSeriesParametersStore(pinia).restoreStoreState(newState?.seriesParametersStore);
}

/**
 * Save the app state to localStorage after actions on the chart parameters,
 * series parameters, data and global sonification parameters stores (not the
 * view store), once no such action has run for 2 seconds. Returns a function
 * that stops saving (and drops a pending save).
 */
export function startLocalStoragePersistence(pinia: Pinia): () => void {
    let persistTimer: ReturnType<typeof setTimeout> | undefined;

    const schedulePersist = () => {
        clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
            const stateJSON = JSON.stringify(getAppState(pinia));
            try {
                window.localStorage.setItem(storageKey + '-' + storageRevision, stateJSON);
            } catch (e) {
                console.error('Error attempting to store app state:', e);
            }
        }, persistDelayMs);
    };

    // Detached: the subscriptions outlive the component or scope they are
    // created in.
    const unsubscribers = [
        useChartParametersStore(pinia).$onAction(({ after }) => after(schedulePersist), true),
        useSeriesParametersStore(pinia).$onAction(({ after }) => after(schedulePersist), true),
        useDataStore(pinia).$onAction(({ after }) => after(schedulePersist), true),
        useGlobalSonifyParametersStore(pinia).$onAction(({ after }) => after(schedulePersist), true)
    ];

    return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
        clearTimeout(persistTimer);
    };
}
