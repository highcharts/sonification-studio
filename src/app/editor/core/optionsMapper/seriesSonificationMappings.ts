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
                tracks: [{
                    instrument: options.instrument,
                    roundToMusicalNotes: options.pitchRoundingEnabled
                }]
            }
        };
    }

    public static pitchOptions(options: GenericObject): GenericObject {
        return SeriesSonificationMappings.getMappedOptions(
            'pitch',
            options.pitchType,
            options.pitchPolarity,
            options.pitchMappingProp,
            options.pitchValue,
            options.minNote,
            options.maxNote
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
            panValueTranslate(options.minPan),
            panValueTranslate(options.maxPan)
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
            volumeValueTranslate(options.minVolume),
            volumeValueTranslate(options.maxVolume)
        );
    }

    public static durationOptions(options: GenericObject): GenericObject {
        return SeriesSonificationMappings.getMappedOptions(
            'noteDuration',
            options.durationType,
            options.durationPolarity,
            options.durationMappingProp,
            options.durationValue,
            options.minDuration,
            options.maxDuration
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
        min: any,
        max: any
    ): GenericObject {
        const mapped = type === 'mapped';
        const fixed = type === 'fixed';
        const mappedValue = (polarity === 'negative' ? '-' : '') + mappedProp;

        if (!mapped && !fixed) {
            return {};
        }

        return {
            sonification: {
                tracks: [{
                    mapping: {
                        [mappingKey]: mapped ? {
                            mapTo: mappedValue,
                            min,
                            max
                        } : fixedValue
                    }
                }]
            }
        };
    }
}
