import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import Highcharts from '../../src/app/editor/core/highchartsSetup';

// The modules register themselves on the instance the 'highcharts' import
// returns. Guards against a module, or the theme, missing or registering on
// another instance after a Highcharts upgrade.
describe('highchartsSetup tests', () => {
    test('Modules are registered on the app instance', () => {
        expect(typeof Highcharts.stockChart).toBe('function');
        expect(Highcharts.getOptions().plotOptions?.arearange).toBeDefined(); // highcharts-more
        expect(Highcharts.getOptions().exporting?.buttons).toBeDefined();
        expect(Highcharts.Chart.prototype.sonify).toBeDefined();
        expect(Highcharts.sonification.InstrumentPresets?.piano).toBeDefined();
        expect(Highcharts.getOptions().accessibility).toBeDefined();
        expect(typeof Highcharts.data).toBe('function');
        expect(Highcharts.getOptions().plotOptions?.series?.label).toBeDefined();
        expect(Highcharts.getOptions().lang?.noData).toBeDefined();
    });

    test('The high-contrast theme and a light color scheme apply', () => {
        const palette = Highcharts.getOptions().palette;
        expect(palette?.light?.colors?.[0]).toBe('#265FB5');
        expect(palette?.colorScheme).toBe('light');
    });
});

describe('highchartsSetup plugins', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        Highcharts.charts.forEach((chart) => chart?.destroy());
        container.remove();
    });

    test('Aria-labels have the escaped names as text', async () => {
        // The chart renders to the container, whose labels the plugin watches
        Highcharts.chart(container, {
            legend: { enabled: true },
            series: [
                { type: 'line', name: '&lt;b&gt;Temp&lt;/b&gt; &amp; co', data: [1, 2] },
                { type: 'line', name: 'x&lt;10', data: [2, 1] }
            ]
        });
        await Promise.resolve();

        const labels = Array.from(container.querySelectorAll('[aria-label]'))
            .map((element) => element.getAttribute('aria-label') || '');
        expect(labels).toContain('Show <b>Temp</b> & co');
        expect(labels).toContain('Show x<10');
        expect(labels.filter((label) => /&(amp|lt|gt|quot|#39);/.test(label))).toEqual([]);

        // Labels set later on too, each entity decoded once
        const later = document.createElement('div');
        later.setAttribute('aria-label', 'a &quot;b&quot; &#39;c&#39; &amp;lt;');
        container.appendChild(later);
        await Promise.resolve();
        expect(later.getAttribute('aria-label')).toBe('a "b" \'c\' &lt;');
        // Not decoded again when the observer sees the decoded label
        await Promise.resolve();
        expect(later.getAttribute('aria-label')).toBe('a "b" \'c\' &lt;');
    });

    test('The focus border is not drawn around a destroyed element', () => {
        const chart = Highcharts.chart(container, { series: [{ type: 'line', data: [1, 2, 3] }] });
        const focusChart = chart as typeof chart & {
            focusElement?: Highcharts.SVGElement;
            renderFocusBorder(): void;
        };
        const element = chart.renderer.rect(0, 0, 10, 10).add();
        focusChart.focusElement = element;
        // As the graphic of a focused point, which an update replaced
        element.destroy();

        expect(() => focusChart.renderFocusBorder()).not.toThrow();
        expect(focusChart.focusElement).toBeUndefined();
    });
});
