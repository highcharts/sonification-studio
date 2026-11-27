import { describe, expect, test } from 'vitest';
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
