/*
 * Utility class for announcing messages to screen readers
 */
export default class Announcer {
    private container?: HTMLElement;
    private clearAnnouncementRegionTimer?: number;

    public init(container: HTMLElement): void {
        const hiddenStyle = {
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            clip: 'rect(1px, 1px, 1px, 1px)',
            marginTop: '-3px',
            '-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=1)',
            filter: 'alpha(opacity=1)',
            opacity: '0.01'
        };
        const c = this.container = container;

        c.setAttribute('aria-live', 'polite');
        c.className = 'a11y-announce-container';
        Object.assign(c.style, hiddenStyle);
    }

    public announce(message: string): void {
        if (this.container) {
            this.container.innerHTML = message;
        }

        // Delete contents after a little while to avoid user finding the live
        // region in the DOM.
        if (this.clearAnnouncementRegionTimer) {
            clearTimeout(this.clearAnnouncementRegionTimer);
        }
        this.clearAnnouncementRegionTimer = setTimeout((): void => {
            if (this.container) {
                this.container.innerHTML = '';
            }
            delete this.clearAnnouncementRegionTimer;
        }, 1000);
    }
}
