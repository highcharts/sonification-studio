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
        return SeriesSonificationMappings.getMappedOptions(
            'frequency',
            options.pitchType,
            options.pitchPolarity,
            options.pitchMappingProp,
            options.pitchValue,
            {
                minFrequency: options.minFreq,
                maxFrequency: options.maxFreq
            }
        );
    }

    public static panOptions(options: GenericObject): GenericObject {
        return SeriesSonificationMappings.getMappedOptions(
            'pan',
            options.panType,
            options.panPolarity,
            options.panMappingProp,
            options.panValue,
            {
                minPan: options.minPan,
                maxPan: options.maxPan
            }
        );
    }

    public static volumeOptions(options: GenericObject): GenericObject {
        return SeriesSonificationMappings.getMappedOptions(
            'volume',
            options.volumeType,
            options.volumePolarity,
            options.volumeMappingProp,
            options.volumeValue,
            {
                minVolume: options.minVolume,
                maxVolume: options.maxVolume
            }
        );
    }

    /**
     * Since the handling of the mappings for the different properties is very similar,
     * we use this utility to do the generic conversion. Basically we use `null` values
     * if the default is to be used.
     */
    private static getMappedOptions(
        mappingKey: string,
        type: string,
        polarity: string,
        mappedProp: string,
        fixedValue: any,
        additionalOptions: GenericObject
    ): GenericObject {
        const mapped = type === 'mapped';
        const fixed = type === 'fixed';
        const mappedValue = (polarity === 'negative' ? '-' : '') + mappedProp;
        // We only add the additional options if type is 'mapping'
        const additionalOptsMapped = Object.keys(additionalOptions)
            .reduce((res: GenericObject, key): GenericObject => {
                res[key] = mapped ? additionalOptions[key] : null;
                return res;
            }, {});

        return {
            sonification: {
                instruments: [Object.assign({
                    mapping: {
                        [mappingKey]: mapped ? mappedValue : fixed ? fixedValue : null
                    }
                }, additionalOptsMapped)]
            }
        };
    }
}
