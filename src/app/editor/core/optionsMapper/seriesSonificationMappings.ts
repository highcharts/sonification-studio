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
        // UI goes from 0-100, mapping is from -1 to +1
        const panValueTranslate = (x: number): number => (x - 50) / 50;

        return SeriesSonificationMappings.getMappedOptions(
            'pan',
            options.panType,
            options.panPolarity,
            options.panMappingProp,
            panValueTranslate(options.panValue),
            {
                minPan: panValueTranslate(options.minPan),
                maxPan: panValueTranslate(options.maxPan)
            }
        );
    }

    public static volumeOptions(options: GenericObject): GenericObject {
        // UI goes from 0-100, mapping is from 0 to 1
        const volumeValueTranslate = (x: number): number => x / 100;

        return SeriesSonificationMappings.getMappedOptions(
            'volume',
            options.volumeType,
            options.volumePolarity,
            options.volumeMappingProp,
            volumeValueTranslate(options.volumeValue),
            {
                minVolume: volumeValueTranslate(options.minVolume),
                maxVolume: volumeValueTranslate(options.maxVolume)
            }
        );
    }

    public static durationOptions(options: GenericObject): GenericObject {
        return SeriesSonificationMappings.getMappedOptions(
            'duration',
            options.durationType,
            options.durationPolarity,
            options.durationMappingProp,
            options.durationValue,
            {
                minDuration: options.minDuration,
                maxDuration: options.maxDuration
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
