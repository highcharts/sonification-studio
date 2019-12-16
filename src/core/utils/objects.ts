export function setNestedChildProp(obj: object, propStr: string, val: any): void {
    const props = propStr.split('.');
    const firstProp = props.shift();
    if (!props.length) {
        obj[firstProp] = val;
    } else {
        obj[firstProp] = obj[firstProp] || {};
        setNestedChildProp(obj[firstProp], props.join('.'), val);
    }
}

export function deepFreeze(obj: object): object {
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

export function deepClone(obj: object): object {
    const shouldBeCloned = x => typeof x === 'object' && x !== null;
    const isDate = x => x instanceof Date;
    const cloneDate = x => new Date(x.getTime());
    const cloneArray = x => {
            let i = x.length;
            const newArray = [];
            while (i--) {
                newArray[i] = shouldBeCloned(x[i]) ?
                    cloneObject(x[i]) : x[i];
            }
            return newArray;
        };

    function cloneObject(o: object): object {
        if (Array.isArray(o)) {
            return cloneArray(o);
        }
        if (isDate(o)) {
            return cloneDate(o);
        }

        const newObject = {};
        Object.getOwnPropertyNames(o).forEach(prop => {
            const val = o[prop];
            if (shouldBeCloned(val)) {
                newObject[prop] = cloneObject(val);
            } else {
                newObject[prop] = val;
            }
        });
        return newObject;
    }

    return cloneObject(obj);
}
