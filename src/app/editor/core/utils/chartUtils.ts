/**
 * Utilities for working with Highcharts.
 */

import type * as HighchartsModule from 'highcharts';
import type { GenericObject } from './objects';
import { escapeHTML, hasHTMLEntities, unescapeHTML } from './htmlText';

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

// An axis with its data extremes, which Highcharts' declarations leave out
type AxisWithDataExtremes = HighchartsModule.Axis & { dataMin?: number; dataMax?: number };

export function getChartStatistics(chart: Highcharts.Chart): string {
    const numSeries = chart.series.length;
    const totalNumPoints = chart.series.reduce((acc, cur) => acc + (cur.points || []).length, 0);
    const yAxis = chart.yAxis && chart.yAxis[0];
    const xAxis = chart.xAxis && chart.xAxis[0];

    let desc = `Chart has ${numSeries} data series, with ${totalNumPoints} data points in total.`;
    if (yAxis) {
        const { dataMin: min, dataMax: max } = yAxis as AxisWithDataExtremes;
        if (min !== undefined && max !== undefined) {
            desc += ` The minimum data point on the y-axis is at ${min}, and the maximum is ${max}.`;
        }
    }
    if (xAxis) {
        const { dataMin: min, dataMax: max } = xAxis as AxisWithDataExtremes;
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
 * Escape the names of points (text x values, such as labels in the first
 * column), so the chart shows them as text, not as HTML (see escapeHTML).
 */
export function escapePointNames(data: unknown[]): unknown[] {
    return data.map((point) => {
        if (Array.isArray(point) && point.length > 1 && typeof point[0] === 'string') {
            return [escapeHTML(point[0]), ...point.slice(1)];
        }
        if (point && typeof point === 'object' && typeof (point as { name?: unknown }).name === 'string') {
            return { ...point, name: escapeHTML((point as { name: string }).name) };
        }
        return point;
    });
}

/**
 * Show escaped text as text in the accessibility module's aria-labels as
 * well. The app gives Highcharts the series and point names escaped (see
 * escapeHTML), so that the chart shows them as text, not as HTML. Highcharts
 * decodes the entities when it renders text, but puts text into aria-labels
 * as it is, where screen readers would read out the entities (Highcharts
 * 13.1.1). So the entities are decoded in the aria-labels in a chart's
 * element, whenever one is set.
 */
export function plainTextAriaLabelPlugin(Highcharts: typeof HighchartsModule) {
    const decode = (element: Element) => {
        const label = element.getAttribute('aria-label');
        if (label && hasHTMLEntities(label)) {
            element.setAttribute('aria-label', unescapeHTML(label));
        }
    };
    const decodeTree = (element: Element) => {
        decode(element);
        element.querySelectorAll('[aria-label]').forEach(decode);
    };

    // renderTo holds the chart and the accessibility module's elements
    type ChartWithRenderTo = HighchartsModule.Chart & { renderTo?: HTMLElement };
    Highcharts.addEvent(Highcharts.Chart, 'load', function (this: ChartWithRenderTo) {
        const root = this.renderTo;
        if (!root || typeof MutationObserver === 'undefined') {
            return;
        }
        decodeTree(root);
        const observer = new MutationObserver((records) => records.forEach((record) => {
            if (record.type === 'attributes') {
                decode(record.target as Element);
            } else {
                record.addedNodes.forEach((node) => {
                    if (node instanceof Element) {
                        decodeTree(node);
                    }
                });
            }
        }));
        observer.observe(root, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['aria-label']
        });
        Highcharts.addEvent(this, 'destroy', () => observer.disconnect());
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

// A chart with the accessibility module's focus border internals, which are
// not part of Highcharts' declarations
type FocusBorderChart = HighchartsModule.Chart & {
    focusElement?: HighchartsModule.SVGElement;
    renderFocusBorder?: () => void;
};

/**
 * Keep the accessibility module from drawing its focus border around an
 * element that is gone. When a point is focused with the keyboard, its graphic
 * becomes the chart's focus element, and the chart draws the focus border
 * again on every resize. An update that replaces the points (e.g. a new chart
 * type) destroys that graphic, and a later resize (e.g. when the sidebar is
 * hidden) then throws a TypeError (Highcharts 13.1.1). A destroyed SVGElement
 * has none of its properties left, `element` included.
 */
export function destroyedFocusElementPlugin(Highcharts: typeof HighchartsModule) {
    const chartProto = Highcharts.Chart.prototype as FocusBorderChart;
    const renderFocusBorder = chartProto.renderFocusBorder;
    if (!renderFocusBorder) {
        return;
    }
    chartProto.renderFocusBorder = function (this: FocusBorderChart) {
        if (this.focusElement && !this.focusElement.element) {
            delete this.focusElement;
            return;
        }
        renderFocusBorder.call(this);
    };
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
