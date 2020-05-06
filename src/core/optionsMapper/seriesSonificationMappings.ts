import { GenericObject } from '../utils/objects';

export class SeriesSonificationMappings {

    public static panEnabled(value: boolean): GenericObject {
        return {
            sonification: {
                instruments: [{
                    instrumentMapping: {
                        pan: value ? 'x' : 0
                    }
                }]
            }
        };
    }

}
