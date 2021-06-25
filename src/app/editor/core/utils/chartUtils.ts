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

export const axisHelptext = 'Linear is a continuous axis from one value to another. Logarithmic is the same, but displayed so that smaller values are given a larger portion of the axis. Note that logarithmic axes can not have negative values. A category axis is simply a set of categories, where each category can be unrelated to the other. A date axis shows time, where the time value is given as UNIX timestamps (milliseconds since 1970), and displayed as human readable dates/time in the chart.';