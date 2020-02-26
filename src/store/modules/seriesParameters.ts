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
 */

import Vue from 'vue';

interface SeriesParameterOptions {
    seriesId: string;
    parameterName: string;
    parameterValue: any;
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
            Vue.set(seriesParams[id], options.parameterName, options.parameterValue);
        }
    }
};
