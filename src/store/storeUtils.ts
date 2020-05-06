/**
 * Utilities for working with the stores.
 */


/**
 * Make mapping of a component's computed property to the currently selected
 * series for audio mapping controls.
 */
export function makeSelectedAudioMappingSeriesPropertyMapping() {
    return {
        get() { return (this as any).$store.state.viewStore.selectedDataSeriesAudioMapping; },
        set(val: any) { return (this as any).$store.commit('viewStore/setSelectedDataSeriesAudioMapping', val); }
    };
}


/**
 * Return setter and getter functions for a computed property mapped to a
 * series param in seriesParametersStore. Assumes that the component has a
 * "this.selectedSeries" property that contains a string with the currently
 * selected series ID to work on.
 */
export function makeSeriesParamPropertyMapping(
    param: string,
    defaultValue: any = null
) {
    return {
        get() {
            const component = this as any;
            const allParams = component.$store.state.seriesParametersStore.seriesParameters;
            const seriesParams = allParams[component.selectedSeries];
            return (seriesParams && seriesParams[param]) ?? defaultValue;
        },
        set(val: any) {
            const component = this as any;
            const selectedSeries = component.selectedSeries;
            if (selectedSeries) {
                component.$store.commit('seriesParametersStore/setSeriesParameter', {
                    seriesId: selectedSeries,
                    parameterName: param,
                    parameterValue: val
                });
            }
        }
    };
}
