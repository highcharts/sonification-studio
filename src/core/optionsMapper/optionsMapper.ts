import { GenericObject } from '../utils/objects';


class OptionsMapper {
    private options: GenericObject = {};

    public build(): GenericObject {
        return {
            chart: {
                type: this.options.volume > 50 ? 'areaspline' : 'scatter'
            }
        };
    }

    public addSonifyParameter(param: string, value: any) {
        this.options[param] = value;
    }

    public addChartParameter(param: string, value: any) {
        this.options[param] = value;
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
