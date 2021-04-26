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

import Vue from 'vue';
import { GenericObject } from '../../core/utils/objects';

interface SeriesParameterOptions {
    seriesId: string;
    parameterName: string;
    parameterValue: any;
    nestedUnderParent?: string;
}


export const seriesParametersStore = {
    namespaced: true,

    state: {
        seriesParameters: {}
    },

    mutations: {
        // Restore state for project file loading or localStore session restore
        restoreStoreState(state: any, newState: GenericObject) {
            const setOption = (root: GenericObject, key: string, val: any) => {
                if (typeof val !== 'object' || val === null) {
                    Vue.set(root, key, val);
                } else {
                    if (typeof root[key] !== 'object' || root[key] === null) {
                        Vue.set(root, key, {});
                    }
                    for (const [subKey, subVal] of Object.entries(val)) {
                        setOption(root[key], subKey, subVal);
                    }
                }
            };

            for (const [seriesId, options] of Object.entries(newState.seriesParameters)) {
                setOption(state.seriesParameters, seriesId, options);
            }
        },

        setSeriesParameter(state: any, options: SeriesParameterOptions) {
            const seriesParams = state.seriesParameters;
            const id = options.seriesId;
            if (!seriesParams[id]) {
                Vue.set(seriesParams, id, {});
            }

            const seriesOptions = seriesParams[id];
            const parent = options.nestedUnderParent;
            if (parent && !seriesOptions[parent]) {
                Vue.set(seriesOptions, parent, {});
            }

            const obj = parent ? seriesOptions[parent] : seriesOptions;
            Vue.set(obj, options.parameterName, options.parameterValue);
        }
    }
};
