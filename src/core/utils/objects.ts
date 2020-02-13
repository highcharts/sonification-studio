export type GenericObject = { [key: string]: any };

export function isObject(x: unknown): boolean {
    return (x && typeof x === 'object' && !Array.isArray(x));
}


/**
 * Deep merge two objects. Objects are merged together per prop. Arrays
 * are merged by merging each individual item, unless the array lengths
 * differ, in which case it replaces. Other types are merged by
 * replacing the a value with the b value.
 */
export function deepMerge(
    a: GenericObject,
    b: GenericObject
): GenericObject {
    const isArray = (x: unknown): boolean => Array.isArray(x);

    let res = Object.assign({}, typeof a === 'object' ? a : {});

    // Merging in an object
    if (isObject(b)) {
        for (const [key, value] of Object.entries(b)) {
            res[key] = deepMerge(res[key], value);
        }
        return res;
    }

    // Merging two arrays
    if (isArray(a) && isArray(b)) {
        const shouldDeepMergeArrays = a.length === b.length;
        if (shouldDeepMergeArrays) {
            let i = a.length;
            while(i--) {
                res[i] = deepMerge(res[i], b[i]);
            }
        } else {
            res = b; // Replace arrays of different length
        }
        return res;
    }

    // Merging in a primitive (or a function or something else) - overwrites
    return b;
}


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
