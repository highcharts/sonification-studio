import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Announcer from '../../../src/app/editor/core/utils/Announcer';

describe('Announcer', () => {
    let assertive: HTMLElement;
    let polite: HTMLElement;
    let announcer: Announcer;

    beforeEach(() => {
        vi.useFakeTimers();
        assertive = document.body.appendChild(document.createElement('div'));
        polite = document.body.appendChild(document.createElement('div'));
        announcer = new Announcer();
        announcer.init(assertive, polite);
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.replaceChildren();
        delete document.body.dataset.handlerRan;
    });

    test('Announces politely, or assertively when asked', () => {
        expect(polite.getAttribute('aria-live')).toBe('polite');
        expect(assertive.getAttribute('aria-live')).toBe('assertive');

        announcer.announce('Polite message.');
        expect(polite.textContent).toBe('Polite message.');
        expect(assertive.textContent).toBe('');

        announcer.announce('Assertive message.', true);
        expect(assertive.textContent).toBe('Assertive message.');
    });

    test('Announces markup as text: it creates no elements, and runs no handlers', () => {
        // As in a cell value announced after filling a column from it. The
        // handler runs in jsdom's own scope: it marks the document body.
        const message = 'First values are <img src=x onerror="document.body.dataset.handlerRan = \'yes\'">.';

        announcer.announce(message);

        // jsdom loads no images: fire the error event a created <img> would get
        polite.querySelectorAll('img').forEach(img => img.dispatchEvent(new Event('error')));
        expect(document.body.dataset.handlerRan).toBeUndefined();
        expect(polite.children).toHaveLength(0);
        expect(polite.textContent).toBe(message);
    });

    test('Replaces the text when the same message is announced again', () => {
        announcer.announce('Same message.');
        const firstNode = polite.firstChild;

        announcer.announce('Same message.');

        // A new text node, so that screen readers announce it again
        expect(polite.firstChild).not.toBe(firstNode);
        expect(polite.textContent).toBe('Same message.');
    });

    test('Clears the message 5 seconds after the last announcement', () => {
        announcer.announce('First.');
        vi.advanceTimersByTime(4000);
        announcer.announce('Second.');
        vi.advanceTimersByTime(4999);
        expect(polite.textContent).toBe('Second.');

        vi.advanceTimersByTime(1);
        expect(polite.textContent).toBe('');
        expect(polite.childNodes).toHaveLength(0);
    });
});
