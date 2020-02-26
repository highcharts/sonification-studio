import { SeriesMappings } from './seriesMappings';
import { GenericObject, deepMerge } from '../utils/objects';


function toSeriesOptionsObject(seriesParameters: GenericObject): GenericObject {
    let res = {};

    for (const [param, val] of Object.entries(seriesParameters)) {
        const options = (SeriesMappings as any)[param](val);
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
