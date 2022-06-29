import { GenericObject } from '../utils/objects';
import { speedToDuration } from '../utils/sonificationTools';

export class GlobalSonificationMappings {

    public static volume(value: number): GenericObject {
        return {
            sonification: {
                masterVolume: value / 100
            }
        };
    }

    public static speed(value: number): GenericObject {
        return {
            sonification: { duration: speedToDuration(value) }
        };
    }

    public static order(value: string): GenericObject {
        return {
            sonification: { order: value }
        };
    }

    public static playMarkerEnabled(value: boolean): GenericObject {
        return {
            sonification: { showPlayMarker: value }
        };
    }

    public static tooltipMarkerEnabled(value: boolean): GenericObject {
        return {
            sonification: { showCrosshairOnly: !value }
        };
    }

    public static detail(value: number): GenericObject {
        const timespan = 1300 - Math.log(value) * 478; // Val goes from 1-15
        return {
            sonification: {
                defaultInstrumentOptions: {
                    pointGrouping: {
                        groupTimespan: timespan
                    }
                }
            }
        };
    }

    public static minNote(value: number): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    mapping: {
                        pitch: {
                            min: value
                        }
                    }
                }
            }
        };
    }

    public static maxNote(value: number): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    mapping: {
                        pitch: {
                            max: value
                        }
                    }
                }
            }
        };
    }

    public static panEnabled(value: boolean): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    mapping: {
                        pan: value ? {
                            mapTo: 'x'
                        } : 0
                    }
                }
            }
        };
    }

    public static panWidth(value: number, chart: unknown, params: GenericObject): GenericObject {
        if (!params.panEnabled) {
            return {};
        }
        return {
            sonification: {
                defaultInstrumentOptions: {
                    mapping: {
                        pan: {
                            min: 0 - value / 100,
                            max: 0 + value / 100
                        }
                    }
                }
            }
        };
    }
}
