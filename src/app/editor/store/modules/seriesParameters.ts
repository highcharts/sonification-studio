/*
    Data store for series options.

    These are options specific to a certain data series.

    Due to the dynamic nature of these options, they are structured
    under a common hashmap-type object as follows:

    seriesParameters: {
        seriesId: {
            seriesName: '',
            seriesColor: ''
            // ...
        },
        otherSeriesId: { ... }
    }

    By specifying a parent option, it is possible to nest options under a common name.
    This means all of the options will be treated as one, and converted with
    the same mapping function. Example:

    seriesParameters: {
        seriesId: {
            myOptionThatHasMultipleInputs: {
                data1: '',
                data2: true,
                data3: 0
            }
            // ...
        }
    }

    In the above case, we will look for a 'myOptionThatHasMultipleInputs' function to
    do the conversion (see seriesOptionsMapper).
*/

import { defineStore } from 'pinia';
import { GenericObject } from '../../core/utils/objects';

// The parameters of one series: parameter name -> value, or parent name ->
// the parameters nested under it. Open-ended by design (see above).
export type SeriesOptions = GenericObject;

export interface SeriesParametersState {
    // Series id -> the parameters of that series
    seriesParameters: Record<string, SeriesOptions>;
}

export interface SeriesParameterOptions {
    seriesId: string;
    parameterName: string;
    parameterValue: unknown;
    nestedUnderParent?: string;
}


export const useSeriesParametersStore = defineStore('seriesParameters', {
    state: (): SeriesParametersState => ({
        seriesParameters: {}
    }),

    actions: {
        // Restore state for project file loading/localStorage session restore,
        // or reapply defaults if no new state is provided.
        restoreStoreState(newState?: SeriesParametersState) {
            const setOption = (root: GenericObject, key: string, val: unknown) => {
                if (typeof val !== 'object' || val === null) {
                    root[key] = val;
                } else {
                    if (typeof root[key] !== 'object' || root[key] === null) {
                        root[key] = {};
                    }
                    for (const [subKey, subVal] of Object.entries(val)) {
                        setOption(root[key], subKey, subVal);
                    }
                }
            };

            // Reset
            this.seriesParameters = {};

            if (newState) {
                for (const [seriesId, options] of Object.entries(newState.seriesParameters)) {
                    setOption(this.seriesParameters, seriesId, options);
                }
            }
        },

        clearState() {
            this.seriesParameters = {};
        },

        setSeriesParameter(options: SeriesParameterOptions) {
            const seriesParams = this.seriesParameters;
            const id = options.seriesId;
            if (!seriesParams[id]) {
                seriesParams[id] = {};
            }

            const seriesOptions = seriesParams[id];
            const parent = options.nestedUnderParent;
            if (parent && !seriesOptions[parent]) {
                seriesOptions[parent] = {};
            }

            const obj = parent ? seriesOptions[parent] : seriesOptions;
            obj[options.parameterName] = options.parameterValue;
        }
    }
});
