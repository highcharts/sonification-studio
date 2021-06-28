/**
 * Utilities for working with Highcharts.
 */

import { GenericObject } from './objects';

type DropdownItemDefinition = { name: string; value: string };

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
    const totalNumPoints = chart.series.reduce((acc, cur) => acc + cur.points.length, 0);
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

export const axisTypes = [{
    name: 'Linear',
    value: 'linear'
}, {
    name: 'Logarithmic',
    value: 'logarithmic'
}, {
    name: 'Category',
    value: 'category'
}, {
    name: 'Date',
    value: 'datetime'
}];

export const axisHelptext = 'Linear is a continuous axis from one value to another.<br>Logarithmic is the same, but displayed so that smaller values are given a larger portion of the axis. Note that logarithmic axes can not have negative values.<br>A category axis is simply a set of categories, where each category can be unrelated to the other.<br>A date axis shows time, where the time value is given as UNIX timestamps (milliseconds since 1970), and displayed as human readable dates/time in the chart.';