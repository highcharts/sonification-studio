/*
 * Utility class for announcing messages to screen readers.
 * If only given one container, polite announcements are supported only.
 */
export default class Announcer {
    private containerPolite?: HTMLElement;
    private containerAssertive?: HTMLElement;
    private clearAnnouncementRegionTimer?: number;

    public init(containerA: HTMLElement, containerB?: HTMLElement): void {
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
        const cA = this.containerAssertive = containerA;
        const cP = this.containerPolite = containerB || containerA;
        cA.setAttribute('aria-live', 'assertive');
        cP.setAttribute('aria-live', 'polite');
        cP.className = cA.className = 'a11y-announce-container';
        Object.assign(cA.style, hiddenStyle);
        Object.assign(cP.style, hiddenStyle);
    }

    public announce(message: string, assertive = false): void {
        const container = assertive ? this.containerAssertive : this.containerPolite;
        if (container) {
            container.innerHTML = message;
        }

        // Delete contents after a little while to avoid user finding the live
        // region in the DOM.
        if (this.clearAnnouncementRegionTimer) {
            clearTimeout(this.clearAnnouncementRegionTimer);
        }
        this.clearAnnouncementRegionTimer = setTimeout((): void => {
            if (container) {
                container.innerHTML = '';
            }
            delete this.clearAnnouncementRegionTimer;
        }, 5000);
    }
}
