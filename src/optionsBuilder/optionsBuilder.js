import { setNestedChildProp, deepClone } from '../utils/objects';

export class OptionsBuilder {
    constructor(defaultOptions) {
        this.newOptions = deepClone(defaultOptions || {});
    }

    build() {
        return this.newOptions || {};
    }

    setOption(option, val) {
        setNestedChildProp(this.newOptions, option, val);
    }
}
