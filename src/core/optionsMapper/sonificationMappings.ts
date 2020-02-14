import { GenericObject } from '../utils/objects';

export class SonificationMappings {

    public static volume(value: number): GenericObject {
        // TODO: Introduce a master volume.
        // Having to set this per instrument is just silly
        return {
            sonification: {
                instruments: [{
                    instrumentMapping: {
                        volume: value / 100
                    }
                }]
            }
        };
    }

    public static speed(value: number): GenericObject {
        return {
            sonification: {
                duration: 3000 - value * 25
            }
        };
    }

    public static minimumFrequency(value: number): GenericObject {
        return {
            sonification: {
                instruments: [{
                    instrumentOptions: {
                        minFrequency: value
                    }
                }]
            }
        };
    }

    public static maximumFrequency(value: number): GenericObject {
        return {
            sonification: {
                instruments: [{
                    instrumentOptions: {
                        maxFrequency: value
                    }
                }]
            }
        };
    }

    public static panning(value: boolean): GenericObject {
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
