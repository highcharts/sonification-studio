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

    public static seriesOpacity(value: number): GenericObject {
        return { opacity: value / 100 };
    }

    public static seriesType(value: string): GenericObject {
        if(!value){
            return { type: '' };
        }
        return { type: value };
    }

    public static seriesVisible(value: boolean): GenericObject {
        return { visible: value };
    }

    public static seriesShowInLegend(value: boolean): GenericObject {
        return { showInLegend: value };
    }

    public static dashStyle(value: string): GenericObject {
        return { dashStyle: value };
    }

    public static dataLabelsEnabled(value: boolean): GenericObject {
        return { dataLabels: { enabled: value } };
    }

}
