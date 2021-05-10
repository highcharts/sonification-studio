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
