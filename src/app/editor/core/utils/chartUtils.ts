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
