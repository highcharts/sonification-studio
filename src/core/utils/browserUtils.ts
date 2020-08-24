export function downloadURI(dataURI: string): void {
    if (dataURI) {
        const link = document.createElement('a');
        link.setAttribute('href', dataURI);
        link.setAttribute('download', 'export.csv');
        link.click();
    }
}
