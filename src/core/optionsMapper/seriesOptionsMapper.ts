import { SeriesMappings } from './seriesMappings';
import { SeriesSonificationMappings } from './seriesSonificationMappings';
import { GenericObject, deepMerge } from '../utils/objects';


function toSeriesOptionsObject(seriesParameters: GenericObject): GenericObject {
    let res = {};

    for (const [param, val] of Object.entries(seriesParameters)) {
        const mapper = (SeriesMappings as any)[param] || (SeriesSonificationMappings as any)[param];
        const options = mapper(val);
        res = deepMerge(res, options);
    }

    return res;
}


export function getSeriesOptionsFromParameters(
    seriesParameters: GenericObject,
    seriesIds: string[]
): GenericObject[] {
    return seriesIds.map(
        id => toSeriesOptionsObject(seriesParameters[id] || {}));
}
