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
