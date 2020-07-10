import { GenericObject } from '../utils/objects';

export class SeriesSonificationMappings {

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

    public static panOptions(options: GenericObject): GenericObject {
        const type = options.panType;
        const mapped = type === 'mapped';
        const fixed = type === 'fixed';
        const mappedPan = (options.panPolarity === 'negative' ? '-' : '') + options.panMappingProp;

        return {
            sonification: {
                instruments: [{
                    minPan: mapped ? options.minPan : null,
                    maxPan: mapped ? options.maxPan : null,
                    mapping: {
                        pan: mapped ? mappedPan : fixed ? options.panValue : null
                    }
                }]
            }
        };
    }
}
