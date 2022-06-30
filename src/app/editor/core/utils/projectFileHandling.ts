/*
    Handle project file storing and loading.
*/

import { Store } from 'vuex';
import { downloadURI } from './browserUtils';
import LZString from './lz-string.min.js';
import { storageRevision } from '../../store/store';
import { version } from '../../../../../package.json';

export function downloadProjectFile(projectTitle: string, store: Store<any>): void {
    const state = store.state;
    state.appVersion = version;
    state.storeVersion = storageRevision;
    const json = JSON.stringify(state);
    const compressed = LZString.compressToUTF16(json);
    const blob = new Blob([compressed], {type: 'application/octet-stream'});
    const uri = window.URL.createObjectURL(blob);
    const filename = projectTitle + '.hssp';
    downloadURI(uri, filename);
}

export function restoreFromProjectFile(fileContents: string, store: Store<any>): void {
    const uncompressed = LZString.decompressFromUTF16(fileContents);
    if (uncompressed) {
        const obj = JSON.parse(uncompressed);
        const storeVersion = obj.storeVersion;
        if (!storeVersion || storeVersion < storageRevision) {
            console.warn(`Loading project format version ${storeVersion}. Current version is ${storageRevision}.`);
            alert('You are loading a project file from an older version. It may be incompatible with the current version. Please contact us for help with recovering old projects.');
        }
        delete obj.storeVersion;
        delete obj.appVersion;
        store.dispatch('restoreState', obj);
    } else {
        throw new Error('Project file not valid.');
    }
}
