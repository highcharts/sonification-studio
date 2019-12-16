export function setNestedChildProp(obj: any, propStr: string, val: any): void {
    const props = propStr.split('.');
    const firstProp = props.shift();
    if (!firstProp) {
        return;
    }

    if (!props.length) {
        obj[firstProp] = val;
    } else {
        obj[firstProp] = obj[firstProp] || {};
        setNestedChildProp(obj[firstProp], props.join('.'), val);
    }
}

export function deepFreeze(obj: any): object {
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

export function deepClone(obj: any): object {
    const shouldBeCloned = (x: any) => typeof x === 'object' && x !== null;
    const isDate = (x: any) => x instanceof Date;
    const cloneDate = (x: any) => new Date(x.getTime());
    const cloneArray = (x: any) => {
        let i = x.length;
        const newArray = [];
        while (i--) {
            newArray[i] = shouldBeCloned(x[i]) ?
                cloneObject(x[i]) : x[i];
        }
        return newArray;
    };

    function cloneObject(o: any): object {
        if (Array.isArray(o)) {
            return cloneArray(o);
        }
        if (isDate(o)) {
            return cloneDate(o);
        }

        const newObject: any = {};
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
