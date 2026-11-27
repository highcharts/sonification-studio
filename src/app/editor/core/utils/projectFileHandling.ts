/*
    Handle project file storing and loading.
*/

import type { Pinia } from 'pinia';
import { downloadURI } from './browserUtils';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { type AppState, getAppState, restoreAppState, storageRevision } from '../../store/store';
import { version } from '../../../../../package.json';

// Contents of a project file: the app state, plus the versions it was saved
// with. Without the Google API key: a project file is meant to be shared, and
// the key is the user's own.
interface ProjectFileState extends Omit<AppState, 'dataStore'> {
    dataStore: Omit<AppState['dataStore'], 'googleApiKey'>;
    appVersion: string;
    storeVersion: number;
}

// The app state for a project file, without the Google API key
function getProjectState(pinia?: Pinia): Omit<ProjectFileState, 'appVersion' | 'storeVersion'> {
    const appState = getAppState(pinia);
    const { googleApiKey, ...dataStore } = appState.dataStore;
    void googleApiKey;
    return { ...appState, dataStore };
}

/**
 * Save the app state as a project file (<projectTitle>.hssp). Uses the given
 * Pinia instance, or the active one.
 */
export function downloadProjectFile(projectTitle: string, pinia?: Pinia): void {
    const projectState: ProjectFileState = {
        ...getProjectState(pinia),
        appVersion: version,
        storeVersion: storageRevision
    };
    const json = JSON.stringify(projectState);
    const compressed = compressToUTF16(json);
    const blob = new Blob([compressed], {type: 'application/octet-stream'});
    const uri = window.URL.createObjectURL(blob);
    const filename = projectTitle + '.hssp';
    downloadURI(uri, filename);
}

/**
 * Restore the app state from the contents of a project file. Uses the given
 * Pinia instance, or the active one. Throws if the contents are not a project
 * file.
 */
export function restoreFromProjectFile(fileContents: string, pinia?: Pinia): void {
    const uncompressed = decompressFromUTF16(fileContents);
    if (uncompressed) {
        const obj: Partial<ProjectFileState> = JSON.parse(uncompressed);
        const storeVersion = obj.storeVersion;
        if (!storeVersion || storeVersion < storageRevision) {
            console.warn(`Loading project format version ${storeVersion}. Current version is ${storageRevision}.`);
            alert('You are loading a project file from an older version. It may be incompatible with the current version. Please contact us for help with recovering old projects.');
        }
        delete obj.storeVersion;
        delete obj.appVersion;
        // Files saved before version 1.2.1 have the Google API key of the
        // user who saved them: the editor keeps its own key instead
        if (obj.dataStore) {
            delete (obj.dataStore as { googleApiKey?: string }).googleApiKey;
        }
        restoreAppState(obj, pinia);
    } else {
        throw new Error('Project file not valid.');
    }
}
