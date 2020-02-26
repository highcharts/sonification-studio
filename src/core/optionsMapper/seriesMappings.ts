import { GenericObject } from '../utils/objects';

export class SeriesMappings {

    public static seriesName(value: string): GenericObject {
        return { name: value };
    }

    public static seriesColor(value: string): GenericObject {
        return { color: value };
    }

    public static seriesType(value: boolean): GenericObject {
        return { type: value };
    }

    public static dashStyle(value: string): GenericObject {
        return { dashStyle: value };
    }

    public static dataLabelsEnabled(value: string): GenericObject {
        return { dataLabels: { enabled: value } };
    }

}
