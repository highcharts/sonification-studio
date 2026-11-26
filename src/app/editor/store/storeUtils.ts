/**
 * Utilities for working with the stores.
 */

import { useSeriesParametersStore } from './modules/seriesParameters';


/**
 * Get a parameter of a series, for computed properties of the series settings
 * controls. Returns the default value if the series, the parent or the
 * parameter is not set (null or undefined). Other falsy values (0, false, '')
 * are returned as they are. A parent that is set to such a falsy value instead
 * of an object is returned itself (never the case for parents set through the
 * store).
 *
 * Series parameters are open-ended (see seriesParameters.ts), so their type is
 * not checked: the type of the default value is taken as the parameter type.
 *
 * @param seriesId The series, normally the one selected in the controls.
 * @param parameterName The parameter to get.
 * @param defaultValue Returned if the parameter is not set.
 * @param nestedUnderParent Get the parameter nested under this parent
 * parameter instead of directly under the series.
 */
export function getSeriesParameter<T>(
    seriesId: string,
    parameterName: string,
    defaultValue: T,
    nestedUnderParent?: string
): T {
    const seriesParams = useSeriesParametersStore().seriesParameters[seriesId] || {};
    const parent = nestedUnderParent ? seriesParams[nestedUnderParent] : seriesParams;
    return (parent && parent[parameterName]) ?? defaultValue;
}


/**
 * Set a parameter of a series, for computed properties of the series settings
 * controls. Does nothing without a series id, i.e. when no series is selected.
 *
 * @param seriesId The series, normally the one selected in the controls.
 * @param parameterName The parameter to set.
 * @param parameterValue The new value.
 * @param nestedUnderParent Set the parameter nested under this parent
 * parameter instead of directly under the series.
 */
export function setSeriesParameter(
    seriesId: string,
    parameterName: string,
    parameterValue: unknown,
    nestedUnderParent?: string
): void {
    if (seriesId) {
        useSeriesParametersStore().setSeriesParameter({
            seriesId,
            parameterName,
            parameterValue,
            nestedUnderParent
        });
    }
}
