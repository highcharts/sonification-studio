import { setNestedChildProp, deepClone } from '../utils/objects';

export class OptionsBuilder {
    constructor(defaultOptions) {
        this.newOptions = deepClone(defaultOptions || {});
    }

    build() {
        return this.newOptions || {};
    }

    setOption(nestedOptionName, val) {
        setNestedChildProp(this.newOptions, nestedOptionName, val);
    }
}
