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
