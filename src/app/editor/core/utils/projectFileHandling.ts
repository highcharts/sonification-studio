/*
    Handle project file storing and loading.
*/

import { Store } from 'vuex';
import { downloadURI } from './browserUtils';
import LZString from './lz-string.min.js';

export function downloadProjectFile(projectTitle: string, store: Store<any>): void {
    const state = store.state;
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
        store.dispatch('restoreState', obj);
    } else {
        throw new Error('Project file not valid.');
    }
}
