import { GenericObject } from '../utils/objects';


function toSeriesOptionsObject(seriesParameters: GenericObject): GenericObject {
    return {
        color: seriesParameters.seriesColor || null
    };
}


export function getSeriesOptionsFromParameters(
    seriesParameters: GenericObject,
    seriesIds: string[]
): GenericObject[] {
    return seriesIds.map(
        id => toSeriesOptionsObject(seriesParameters[id] || {}));
}
