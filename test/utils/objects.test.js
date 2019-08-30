import { setNestedChildProp, deepFreeze } from '../../src/utils/objects';

describe('setNestedChildProp tests', () => {
    test('Setting single prop on empty object', () => {
        const empty = {};
        setNestedChildProp(empty, 'a', 1);
        expect(empty).toEqual({ a: 1 });
    });

    test('Setting single prop on non-empty object', () => {
        const obj = { a: 3 };
        setNestedChildProp(obj, 'b', 1);
        expect(obj).toEqual({ a: 3, b: 1 });
    });

    test('Modifying single prop', () => {
        const obj = { a: 3 };
        setNestedChildProp(obj, 'a', 1);
        expect(obj).toEqual({ a: 1 });
    });

    test('Setting nested prop on empty object', () => {
        const empty = {};
        setNestedChildProp(empty, 'a.b.c', 1);
        expect(empty).toEqual({ a: { b: { c: 1 } } });
    });

    test('Setting nested prop on non-empty object', () => {
        const obj = { d: { e: 3 }};
        setNestedChildProp(obj, 'a.b.c', 1);
        expect(obj).toEqual({ d: { e: 3 }, a: { b: { c: 1 } } });
    });

    test('Setting nested prop on existing object', () => {
        const obj = { a: { b: { c: { d: 5 } } } };
        setNestedChildProp(obj, 'a.b.f', 1);
        expect(obj).toEqual({ a: { b: { f: 1, c: { d: 5 } } } });
    });

    test('Modifying nested prop on existing object', () => {
        const obj = { a: { b: { c: { d: 5 } } } };
        setNestedChildProp(obj, 'a.b.c.d', 1);
        expect(obj).toEqual({ a: { b: { c: { d: 1 } } } });
        setNestedChildProp(obj, 'a.b.c', 2);
        expect(obj).toEqual({ a: { b: { c: 2 } } });
    });
});

describe('deepFreeze tests', () => {
    const testIllegalOperation = (obj, illegal) => {
        const frozen = deepFreeze(obj);
        expect(() => illegal(frozen)).toThrow();
    };

    test('Given frozen object, can not add prop', () => {
        testIllegalOperation(
            {},
            o => o.a = 1
        );
    });

    test('Given frozen object, can not modify prop', () => {
        testIllegalOperation(
            { a: 1 },
            o => o.a = 2
        );
    });

    test('Given frozen object, can not modify array prop', () => {
        testIllegalOperation(
            { a: [0] },
            o => o.a.push(1)
        );
    });

    test('Given frozen object, can not modify function prop', () => {
        testIllegalOperation(
            { a: function () {} },
            o => o.a.prototype = {}
        );
    });

    test('Given frozen object, can not modify object prop', () => {
        testIllegalOperation(
            { a: { b: { c: 1 } } },
            o => o.a.b.c = 2
        );
    });

    test('Integration test', () => {
        testIllegalOperation(
            { a: { b: { c: [6, 5, 3, 1, 0, 2] } } },
            o => o.a.b.c.sort()
        );
    });
});
