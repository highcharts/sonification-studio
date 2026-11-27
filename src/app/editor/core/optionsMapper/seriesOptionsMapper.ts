import { SeriesMappings } from './seriesMappings';
import { SeriesSonificationMappings } from './seriesSonificationMappings';
import { type GenericObject, deepMerge } from '../utils/objects';

// A mapping class's static methods, looked up by parameter name: each maps a
// parameter's value to series options
type MappingTable = Record<string, ((value: unknown) => GenericObject) | undefined>;
const seriesMappings = SeriesMappings as unknown as MappingTable;
const seriesSonificationMappings = SeriesSonificationMappings as unknown as MappingTable;


/*
 * Map parameters to options object using series mappings and series sonification mappings.
 */
function toSeriesOptionsObject(seriesParameters: GenericObject): GenericObject {
    let res = {};

    for (const [param, val] of Object.entries(seriesParameters)) {
        const mapper = seriesMappings[param] || seriesSonificationMappings[param];
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
