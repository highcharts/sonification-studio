import { SeriesMappings } from './seriesMappings';
import { SeriesSonificationMappings } from './seriesSonificationMappings';
import { GenericObject, deepMerge } from '../utils/objects';


/*
 * Map parameters to options object using series mappings and series sonification mappings.
 */
function toSeriesOptionsObject(seriesParameters: GenericObject): GenericObject {
    let res: GenericObject = {};
    res['type'] = '';

    for (const [param, val] of Object.entries(seriesParameters)) {
        const mapper = (SeriesMappings as any)[param] || (SeriesSonificationMappings as any)[param];
        const options = mapper ? mapper(val) : {};
        res = deepMerge(res, options);
    }
    return res;
}


/*
 * Series options are not split into sonification/display options
 */
export function getSeriesOptionsFromParameters(
    seriesParameters: GenericObject,
    seriesIds: string[]
): GenericObject[] {
    return seriesIds.map(
        id => toSeriesOptionsObject(seriesParameters[id] || {}));
}
