// Hide sibling elements from AT and return the hidden elements.
function hideSiblingsFromAT(el: HTMLElement): HTMLElement[] {
    const allElements = el.parentNode?.children || [];
    const hiddenElements: HTMLElement[] = [];

    for (let i = 0; i < allElements.length; ++i) {
        const sibling = allElements[i];
        if (
            sibling !== el &&
            !['script', 'head'].includes(sibling.tagName.toLowerCase()) &&
            sibling.getAttribute('aria-hidden') !== 'true' &&
            !sibling.hasAttribute('aria-live')
        ) {
            sibling.setAttribute('aria-hidden', 'true');
            hiddenElements.push(allElements[i] as HTMLElement);
        }
    }

    return hiddenElements;
}

/**
 * Download a file with data from a data URI.
 * @param dataURI Data URI to download
 * @param title Title of the downloaded file
 */
export function downloadURI(dataURI: string, title: string): void {
    if (dataURI) {
        const link = document.createElement('a');
        link.setAttribute('href', dataURI);
        link.setAttribute('download', title);
        link.click();
    }
}

/**
 * Hide other elements on the page from assistive technology.
 * @param el Element to keep visible
 * @returns List of the hidden elements.
 */
export function hideOtherElementsFromAT(el: HTMLElement): HTMLElement[] {
    const hiddenElements = hideSiblingsFromAT(el);
    const parent = el.parentNode;
    return parent ? hiddenElements.concat(hideOtherElementsFromAT(parent as HTMLElement)) : hiddenElements;
}

/**
 * Unhide a list of elements from AT.
 * @param elements List of elements to unhide
 */
export function unhideElementsFromAT(elements: HTMLElement[]): void {
    elements.forEach(el => el.removeAttribute('aria-hidden'));
}
