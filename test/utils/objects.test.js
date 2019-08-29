import { deepFreeze } from '../../src/utils/objects';

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
