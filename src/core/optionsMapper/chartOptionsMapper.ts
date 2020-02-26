import { GenericObject, deepMerge } from '../utils/objects';
import { ChartMappings } from './chartMappings';
import { SonificationMappings } from './sonificationMappings';


/**
 * Map parameters to chart options
 */
class ChartOptionsMapper {
    private options: GenericObject = {};

    public build(): GenericObject {
        return this.options;
    }

    public addSonifyParameter(param: string, value: unknown) {
        const newOptions = (SonificationMappings as any)[param](value, this.options);
        this.options = deepMerge(this.options, newOptions);
    }

    public addChartParameter(param: string, value: any) {
        const newOptions = (ChartMappings as any)[param](value, this.options);
        this.options = deepMerge(this.options, newOptions);
    }
}


export function getChartOptionsFromParameters(
    sonifyParameters: GenericObject,
    chartParameters: GenericObject
): GenericObject {
    const optionsMapper = new ChartOptionsMapper();

    Object.keys(sonifyParameters).forEach((param: string) =>
        optionsMapper.addSonifyParameter(param, sonifyParameters[param])
    );
    Object.keys(chartParameters).forEach((param: string) =>
        optionsMapper.addChartParameter(param, chartParameters[param])
    );

    return optionsMapper.build();
}
