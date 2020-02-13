import { GenericObject } from '../utils/objects';
import { ChartMappings } from './chartMappings';
import { SonificationMappings } from './sonificationMappings';


/**
 * Map parameters to chart options
 */
class OptionsMapper {
    private options: GenericObject = {};

    public build(): GenericObject {
        return this.options;
    }

    public addSonifyParameter(param: string, value: unknown) {
        const newOptions = (SonificationMappings as any)[param](value, this.options);
        this.options = this.mergeOptions(this.options, newOptions);
    }

    public addChartParameter(param: string, value: any) {
        const newOptions = (ChartMappings as any)[param](value, this.options);
        this.options = this.mergeOptions(this.options, newOptions);
    }

    private mergeOptions(a: GenericObject, b: GenericObject): GenericObject {
        return Object.assign(a, b);
    }
}


export function getChartOptionsFromParameters(
    sonifyParameters: GenericObject,
    chartParameters: GenericObject
): GenericObject {
    const optionsMapper = new OptionsMapper();

    Object.keys(sonifyParameters).forEach((param: string) =>
        optionsMapper.addSonifyParameter(param, sonifyParameters[param])
    );
    Object.keys(chartParameters).forEach((param: string) =>
        optionsMapper.addChartParameter(param, chartParameters[param])
    );

    return optionsMapper.build();
}
