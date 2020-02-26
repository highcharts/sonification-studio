/**
 * Utilities for working with Highcharts.
 */

import { GenericObject } from './objects';

export function getSeriesId(series: GenericObject): string {
    return series.id || `se-hc-series-id-${series.chart.index}-${series.index}`;
}
