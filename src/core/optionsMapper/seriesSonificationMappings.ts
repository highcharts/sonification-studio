import { GenericObject } from '../utils/objects';

export class SeriesSonificationMappings {

    public static sonificationEnabled(value: boolean): GenericObject {
        return {
            sonification: {
                enabled: value
            }
        };
    }

    public static instrument(value: string): GenericObject {
        return {
            sonification: {
                instruments: [{
                    instrument: value
                }]
            }
        };
    }

    public static panType(value: string): GenericObject {
        return {};
    }

    public static panMappingProp(value: string): GenericObject {
        return {};
    }

    public static maxPan(value: number): GenericObject {
        return {};
    }

    public static minPan(value: number): GenericObject {
        return {};
    }

    public static panValue(value: number): GenericObject {
        return {};
    }

    public static panDirection(value: string): GenericObject {
        return {};
    }
}
