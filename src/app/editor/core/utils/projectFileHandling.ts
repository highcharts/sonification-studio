/*
    Handle project file storing and loading.
*/

import type { Pinia } from 'pinia';
import { downloadURI } from './browserUtils';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { type AppState, getAppState, restoreAppState, storageRevision } from '../../store/store';
import { version } from '../../../../../package.json';

// Contents of a project file: the app state, plus the versions it was saved with
interface ProjectFileState extends AppState {
    appVersion: string;
    storeVersion: number;
}

/**
 * Save the app state as a project file (<projectTitle>.hssp). Uses the given
 * Pinia instance, or the active one.
 */
export function downloadProjectFile(projectTitle: string, pinia?: Pinia): void {
    const projectState: ProjectFileState = {
        ...getAppState(pinia),
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
        restoreAppState(obj, pinia);
    } else {
        throw new Error('Project file not valid.');
    }
}
