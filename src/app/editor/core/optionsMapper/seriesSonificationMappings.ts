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
        return SeriesSonificationMappings.getMappedOptions('pitch', options);
    }

    public static panOptions(options: GenericObject): GenericObject {
        // UI goes from 0-100, mapping is from -1 to +1
        const panValueTranslate = (x: number): number => (x - 50) / 50;
        return SeriesSonificationMappings.getMappedOptions('pan', options, panValueTranslate);
    }

    public static volumeOptions(options: GenericObject): GenericObject {
        // UI goes from 0-100, mapping is from 0 to 1
        const volumeValueTranslate = (x: number): number => x / 100;
        return SeriesSonificationMappings.getMappedOptions('volume', options, volumeValueTranslate);
    }

    public static durationOptions(options: GenericObject): GenericObject {
        return SeriesSonificationMappings.getMappedOptions('noteDuration', options);
    }

    /**
     * Since the handling of the mappings for the different properties is very similar,
     * we use this utility to do the generic conversion.
     */
    private static getMappedOptions(
        mappingKey: string,
        options: GenericObject,
        valueTransform?: Function
    ): GenericObject {
        const mapped = options.mappingType === 'mapped';
        const fixed = options.mappingType === 'fixed';
        const mapTo = (options.polarity === 'negative' ? '-' : '') + options.mapTo;
        const min = valueTransform ? valueTransform(options.min) : options.min;
        const max = valueTransform ? valueTransform(options.max) : options.max;
        const fixedValue = valueTransform ? valueTransform(options.fixedValue) : options.fixedValue;

        if (!mapped && !fixed) {
            return {};
        }

        return {
            sonification: {
                tracks: [{
                    mapping: {
                        [mappingKey]: mapped ? { mapTo, min, max} : fixedValue
                    }
                }]
            }
        };
    }
}
