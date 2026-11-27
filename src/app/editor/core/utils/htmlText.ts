/*
    Text from the user (CSV headers and cells, series names) in Highcharts and
    Grid Pro options. Both render text with markup in it as HTML, so the app
    gives them such text escaped, which they show as the text it was.
*/

const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
};

const characters: Record<string, string> = Object.fromEntries(
    Object.entries(entities).map(([character, entity]) => [entity, character])
);

// Text as HTML that parses back to the text. Quotes are escaped too, as
// Highcharts' HTML parser rewrites ' style="' in the markup it is given.
export function escapeHTML(text: string): string {
    return text.replace(/[&<>"']/g, (character) => entities[character]);
}

// Text escaped with escapeHTML, back as it was. Each entity is replaced once,
// so "&amp;lt;" gives "&lt;".
export function unescapeHTML(text: string): string {
    return text.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => characters[entity]);
}

// Whether text has an entity escapeHTML writes
export function hasHTMLEntities(text: string): boolean {
    return /&(?:amp|lt|gt|quot|#39);/.test(text);
}
