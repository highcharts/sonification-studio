import { GenericObject } from '../utils/objects';

export class ChartMappings {

    public static type(value: string): GenericObject {
        return { chart: { type: value } };
    }

    public static legendEnabled(value: boolean): GenericObject {
        return { legend: { enabled: value } };
    }

    public static title(value: string): GenericObject {
        return { title: { text: value } };
    }

    public static subtitle(value: string): GenericObject {
        return { subtitle: { text: value || null } };
    }

    public static xAxisTitle(value: string): GenericObject {
        return { xAxis: { title: { text: value || null } } };
    }

    public static yAxisTitle(value: string): GenericObject {
        return { yAxis: { title: { text: value || null } } };
    }

    public static seriesLabelsEnabled(value: boolean): GenericObject {
        return { plotOptions: { series: { label: { enabled: value } } } };
    }

    public static seriesParameters(value: GenericObject): GenericObject {
        console.log('Series params:', JSON.stringify(value, null, '\t'));
        return {};
    }
}
