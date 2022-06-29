import { GenericObject, deepMerge } from '../utils/objects';
import { ChartMappings } from './chartMappings';
import { GlobalSonificationMappings } from './globalSonificationMappings';


/**
 * Map parameters to chart options
 */
class ChartOptionsMapper {
    private options: GenericObject = {};

    constructor(private chart: GenericObject) {}

    public build(): GenericObject {
        return this.options;
    }

    public addSonifyParameter(param: string, value: unknown, params: GenericObject) {
        const newOptions = (GlobalSonificationMappings as any)[param](value, this.chart, params);
        this.options = deepMerge(this.options, newOptions);
    }

    public addChartParameter(param: string, value: unknown) {
        const newOptions = (ChartMappings as any)[param](value, this.chart);
        this.options = deepMerge(this.options, newOptions);
    }
}


export function getChartOptionsFromParameters(
    sonifyParameters: GenericObject,
    chartParameters: GenericObject,
    chart: GenericObject
): GenericObject {
    const optionsMapper = new ChartOptionsMapper(chart);

    Object.keys(sonifyParameters).forEach((param: string) =>
        optionsMapper.addSonifyParameter(param, sonifyParameters[param], sonifyParameters)
    );
    Object.keys(chartParameters).forEach((param: string) =>
        optionsMapper.addChartParameter(param, chartParameters[param])
    );

    return optionsMapper.build();
}
