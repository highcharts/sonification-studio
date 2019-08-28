export function setNestedChildProp(obj, propStr, val) {
    const props = propStr.split('.'),
        firstProp = props.shift();
    if (!props.length) {
        obj[firstProp] = val;
    } else {
        obj[firstProp] = obj[firstProp] || {};
        setNestedChildProp(obj[firstProp], props.join('.'), val);
    }
}

export function deepFreeze(obj) {
    if (obj === undefined) {
        return obj;
    }
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        const val = obj[prop];
        if (
            val !== null &&
            (typeof val === 'object' || typeof val === 'function') &&
            !Object.isFrozen(val)
        ) {
            deepFreeze(val);
        }
    });
    return obj;
}

export function deepClone(obj) {
    /*
     * Todo:
     * - Needs to deep clone objects
     * - Needs to merge arrays (series)
     * - Needs to handle circular references by replacing the references with
     *  cloned objects
     * - Does not need to merge functions
     * - Needs to handle date objects
     */

    return Object.assign({}, obj);
}