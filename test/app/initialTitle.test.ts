import { describe, it, expect, vi, afterEach } from 'vitest';

// The app entry mounts itself on import, so each test loads a fresh copy.
describe('Initial page title', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        window.location.hash = '';
    });

    it('is set from the route the page is opened on', async () => {
        document.body.innerHTML = '<div id="app"></div>';
        document.title = 'Home | Highcharts Sonification Studio';
        window.location.hash = '#/tutorial';
        vi.resetModules();

        await import('../../src/app/public/app');

        await vi.waitFor(() => {
            expect(document.title).toBe('Tutorial | Highcharts Sonification Studio');
        });
    });
});
