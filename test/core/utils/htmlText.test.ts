import { describe, expect, test } from 'vitest';
import { escapeHTML, hasHTMLEntities, unescapeHTML } from '../../../src/app/editor/core/utils/htmlText';

describe('htmlText', () => {
    const texts = ['<b>bold</b>', 'R&D', 'Fish &amp; chips', 'Size style="big"', 'it\'s', 'plain'];

    test('Escapes text as HTML that parses back to it', () => {
        expect(escapeHTML('<b class="x">R&D\'s</b>')).toBe('&lt;b class=&quot;x&quot;&gt;R&amp;D&#39;s&lt;/b&gt;');
        for (const text of texts) {
            const element = document.createElement('div');
            element.innerHTML = escapeHTML(text);
            expect(element.textContent).toBe(text);
            expect(element.children).toHaveLength(0);
        }
    });

    test('Unescapes escaped text back as it was, each entity once', () => {
        for (const text of texts) {
            expect(unescapeHTML(escapeHTML(text))).toBe(text);
        }
        expect(unescapeHTML('&amp;lt;')).toBe('&lt;');
    });

    test('Tells whether text has the entities it writes', () => {
        expect(hasHTMLEntities('a &lt; b')).toBe(true);
        expect(hasHTMLEntities('a < b & c')).toBe(false);
    });
});
