import { GenericObject } from '../utils/objects';

export class GlobalSonificationMappings {

    public static volume(value: number): GenericObject {
        return {
            sonification: {
                masterVolume: value / 100
            }
        };
    }

    public static playbackOpts(value: { duration: number; order: string }, chart: GenericObject): GenericObject {
        const order = value.order;
        const duration = value.duration;
        return {
            sonification: { duration, order }
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
        const timespan = 480 - Math.log(value) * 170; // Val goes from 1-15
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

    public static panWidth(value: number): GenericObject {
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
