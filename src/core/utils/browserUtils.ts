export function downloadURI(dataURI: string, title: string): void {
    if (dataURI) {
        const link = document.createElement('a');
        link.setAttribute('href', dataURI);
        link.setAttribute('download', title);
        link.click();
    }
}
