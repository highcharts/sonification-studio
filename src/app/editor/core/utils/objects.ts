// An open-ended object, such as Highcharts options or a chart, whose
// properties are read and written without declaring them. The one explicit
// `any` the linter allows: Highcharts' options and internals are too many and
// too dynamic to declare where the chart code uses them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = { [key: string]: any };


let uuidIx = 0;
export function getUUID(prefix = ''): string {
    uuidIx++;
    const randomStr = (Math.random() * 100000 | 0).toString(16);
    return prefix + '-' + randomStr + '-' + uuidIx;
}


export function isObject(x: unknown): boolean {
    return !!(x && typeof x === 'object' && !Array.isArray(x));
}


export function firstDefined<A, B>(a: A, b: B): Exclude<A, undefined> | B {
    return typeof a !== 'undefined' ? a as Exclude<A, undefined> : b;
}


export function nullFallback<T1, T2>(a: T1 | null, b: T2): T1|T2 {
    return a === null ? b : a;
}


/**
 * Deep merge two objects. Objects are merged together per prop. Arrays
 * are merged by merging each individual item, unless the array lengths
 * differ, in which case it replaces. Other types are merged by
 * replacing the a value with the b value.
 */
export function deepMerge(
    a: unknown,
    b: unknown
): GenericObject {
    const res: GenericObject = Object.assign({}, typeof a === 'object' ? a : {});

    // Merging in an object
    if (isObject(b)) {
        for (const [key, value] of Object.entries(b as GenericObject)) {
            res[key] = deepMerge(res[key], value);
        }
        return res;
    }

    // Merging two arrays
    if (Array.isArray(a) && Array.isArray(b)) {
        const shouldDeepMergeArrays = a.length === b.length;
        if (shouldDeepMergeArrays) {
            return a.map((item: unknown, index: number) => deepMerge(item, b[index]));
        }
        return b; // Replace arrays of different length
    }

    // Merging in a primitive (or a function or something else) - overwrites
    return b as GenericObject;
}


export function setNestedChildProp(obj: GenericObject, propStr: string, val: unknown): void {
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


export function deepFreeze<T>(obj: T): T {
    if (obj === undefined) {
        return obj;
    }
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        const val: unknown = (obj as GenericObject)[prop];
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


export function deepClone(obj: unknown): object {
    const shouldBeCloned = (x: unknown): x is object => typeof x === 'object' && x !== null;
    const cloneArray = (x: unknown[]) => {
        let i = x.length;
        const newArray: unknown[] = [];
        while (i--) {
            newArray[i] = shouldBeCloned(x[i]) ?
                cloneObject(x[i]) : x[i];
        }
        return newArray;
    };

    function cloneObject(o: unknown): object {
        if (Array.isArray(o)) {
            return cloneArray(o);
        }
        if (o instanceof Date) {
            return new Date(o.getTime());
        }

        const newObject: GenericObject = {};
        Object.getOwnPropertyNames(o).forEach(prop => {
            const val: unknown = (o as GenericObject)[prop];
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
