/**
 * Utilities for working with Highcharts.
 */

import type * as HighchartsModule from 'highcharts';
import { GenericObject } from './objects';

type DropdownItemDefinition = { name: string; value: string };

export const seriesTypes = [{
    name: 'Line',
    value: 'line'
}, {
    name: 'Smoothed line',
    value: 'spline'
}, {
    name: 'Area',
    value: 'area'
}, {
    name: 'Smoothed area',
    value: 'areaspline'
}, {
    name: 'Column',
    value: 'column'
}, {
    name: 'Pie',
    value: 'pie'
}, {
    name: 'Scatter',
    value: 'scatter'
}];

export function getSeriesId(series: GenericObject): string {
    return series.id || `se-hc-series-id-${series.index}`;
}

export function getMappingDataProps(): Array<DropdownItemDefinition> {
    const props = ['x', 'y'];
    const propToDropdownItem = (prop: string): DropdownItemDefinition => ({ name: prop, value: prop });
    return props.map(propToDropdownItem);
}

export function getChartStatistics(chart: Highcharts.Chart): string {
    const numSeries = chart.series.length;
    const totalNumPoints = chart.series.reduce((acc, cur) => acc + (cur.points || []).length, 0);
    const yAxis = chart.yAxis && chart.yAxis[0];
    const xAxis = chart.xAxis && chart.xAxis[0];

    let desc = `Chart has ${numSeries} data series, with ${totalNumPoints} data points in total.`;
    if (yAxis) {
        const min = (yAxis as any).dataMin;
        const max = (yAxis as any).dataMax;
        if (min !== undefined && max !== undefined) {
            desc += ` The minimum data point on the y-axis is at ${min}, and the maximum is ${max}.`;
        }
    }
    if (xAxis) {
        const min = (xAxis as any).dataMin;
        const max = (xAxis as any).dataMax;
        if (min !== undefined && max !== undefined) {
            desc += ` The minimum data point on the x-axis is at ${min}, and the maximum is ${max}.`;
        }
    }
    return desc;
}

/**
 * Get the Google Sheets API's message from a Highcharts error message for a
 * failed Google Sheets request, e.g. 'API key not valid. Please pass a valid
 * API key.'. The data module formats these as "Request failed - <HTTP status>
 * \n<response body>". Returns null for other Highcharts errors.
 */
export function getGoogleSheetsErrorMessage(highchartsErrorMessage: string): string | null {
    const prefix = /^Request failed - \d+ \n/.exec(highchartsErrorMessage);
    if (!prefix) {
        return null;
    }
    try {
        const response = JSON.parse(highchartsErrorMessage.slice(prefix[0].length));
        return response?.error?.message || 'Unknown error';
    } catch {
        return 'Unknown error';
    }
}

/**
 * Replace the y values Highcharts cannot plot, such as the text of a label
 * column, with null, so they show as gaps. Highcharts throws error #14 when the
 * first y value of a series is a string. Text x values are kept, the data
 * module uses them as point names.
 */
export function removeNonNumericYValues(data: unknown[]): unknown[] {
    const toY = (y: unknown) => (typeof y === 'string' ? null : y);
    return data.map((point) => {
        if (Array.isArray(point)) {
            // [y] or [x, y]
            const yIndex = point.length > 1 ? 1 : 0;
            return point.map((value, i) => (i === yIndex ? toY(value) : value));
        }
        if (point && typeof point === 'object' && 'y' in point) {
            return { ...point, y: toY(point.y) };
        }
        return toY(point);
    });
}

/**
 * Whether series data has a y value to plot: data from an empty column, or
 * from a column of text after removeNonNumericYValues(), has none.
 */
export function seriesDataHasValues(data: unknown): boolean {
    const hasValue = (y: unknown) => y !== null && y !== void 0 && y !== '';
    return Array.isArray(data) && data.some((point) => {
        if (Array.isArray(point)) {
            // [y] or [x, y]
            return hasValue(point[point.length > 1 ? 1 : 0]);
        }
        if (point && typeof point === 'object') {
            return hasValue((point as { y?: unknown }).y);
        }
        return hasValue(point);
    });
}

// An axis with the internals and custom option the negative log plugin uses,
// which are not part of Highcharts' declarations
type NegativeLogAxis = HighchartsModule.Axis & {
    logarithmic?: {
        log2lin: (num: number) => number;
        lin2log: (num: number) => number;
    };
    positiveValuesOnly: boolean;
    options: { custom?: { allowNegativeLog?: boolean } };
};

/**
 * Custom Axis extension to allow emulation of negative values on a logarithmic
 * Y axis. Note that the scale is not mathematically correct, as a true
 * logarithmic axis never reaches or crosses zero.
 */
export function negativeLogPlugin(Highcharts: typeof HighchartsModule) {
    Highcharts.addEvent<HighchartsModule.Axis>(Highcharts.Axis, 'afterInit', function (this: NegativeLogAxis) {
        const logarithmic = this.logarithmic;

        if (logarithmic && this.options.custom?.allowNegativeLog) {

            // Avoid errors on negative numbers on a log axis
            this.positiveValuesOnly = false;

            // Override the converter functions
            logarithmic.log2lin = (num: number) => {
                const isNegative = num < 0;

                let adjustedNum = Math.abs(num);

                if (adjustedNum < 10) {
                    adjustedNum += (10 - adjustedNum) / 10;
                }

                const result = Math.log(adjustedNum) / Math.LN10;
                return isNegative ? -result : result;
            };

            logarithmic.lin2log = (num: number) => {
                const isNegative = num < 0;

                let result = Math.pow(10, Math.abs(num));
                if (result < 10) {
                    result = (10 * (result - 1)) / (10 - 1);
                }
                return isNegative ? -result : result;
            };
        }
    });
}
