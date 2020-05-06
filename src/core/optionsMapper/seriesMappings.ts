/*
    Series options mappings for chart.
    Sonification related mappings are separated out into its own class.
*/

import { GenericObject } from '../utils/objects';

export class SeriesMappings {

    public static seriesName(value: string): GenericObject {
        return { name: value };
    }

    public static seriesColor(value: string): GenericObject {
        return { color: value };
    }

    public static seriesType(value: string): GenericObject {
        return { type: value };
    }

    public static dashStyle(value: string): GenericObject {
        return { dashStyle: value };
    }

    public static dataLabelsEnabled(value: boolean): GenericObject {
        return { dataLabels: { enabled: value } };
    }

}
