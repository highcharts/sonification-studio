import { GenericObject } from '../utils/objects';

export class SonificationMappings {

    public static volume(value: number): GenericObject {
        return { sonification: { volume: value } };
    }

}
