import { GenericObject } from '../utils/objects';

export class SeriesSonificationMappings {

    public static pitchOptions(options: GenericObject): GenericObject {
        const type = options.pitchType;
        const mapped = type === 'mapped';
        const fixed = type === 'fixed';
        const mappedPitch = (options.pitchPolarity === 'negative' ? '-' : '') + options.pitchMappingProp;

        return {
            sonification: {
                instruments: [{
                    minFrequency: mapped ? options.minFreq : null,
                    maxFrequency: mapped ? options.maxFreq : null,
                    mapping: {
                        frequency: mapped ? mappedPitch : fixed ? options.pitchValue : null
                    }
                }]
            }
        };
    }

    public static sonificationEnabled(value: boolean): GenericObject {
        return {
            sonification: {
                enabled: value
            }
        };
    }

    public static instrument(options: GenericObject): GenericObject {
        return {
            sonification: {
                instruments: [{
                    instrument: options.instrument + (options.pitchRoundingEnabled ? 'Musical' : '')
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
