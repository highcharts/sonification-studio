/**
 * Utilities for working with Highcharts.
 */

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
},{
    name: 'Column + Errorbar',
    value: 'columnErrorbar'
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
 * Custom Axis extension to allow emulation of negative values on a logarithmic
 * Y axis. Note that the scale is not mathematically correct, as a true
 * logarithmic axis never reaches or crosses zero.
 */
export function negativeLogPlugin(Highcharts: any) {
    Highcharts.addEvent(Highcharts.Axis, 'afterInit', function (this: any) {
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
