import { deepClone, setNestedChildProp } from '../utils/objects';

export class OptionsBuilder {
    private newOptions: object;

    constructor(defaultOptions?: object) {
        this.newOptions = deepClone(defaultOptions || {});
    }

    public build(): object {
        return this.newOptions || {};
    }

    public setOption(nestedOptionName: string, val: any): void {
        setNestedChildProp(this.newOptions, nestedOptionName, val);
    }
}
