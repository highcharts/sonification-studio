import { OptionsBuilder } from '../../src/optionsBuilder/optionsBuilder';
import { deepFreeze } from '../../src/utils/objects';

describe('Tests for optionsBuilder', () => {
    const defaultOptions = deepFreeze({
            test1: 0,
            test2: '1',
            test3: [3, 4, 5],
            test4: {
                test5: [4, 5, 6],
                test6: { test7: 'test' }
            }
        }),
        expectOutput = (ob, output) => expect(ob.build()).toEqual(output);

    test('Given no options it should return empty object', () => {
        const ob = new OptionsBuilder();
        expectOutput(ob, {});
    });

    test('Given only default options it should return them unaltered', () => {
        const ob = new OptionsBuilder(defaultOptions);
        expectOutput(ob, defaultOptions);
    });

    test('Setting new option directly', () => {
        const ob = new OptionsBuilder(defaultOptions);
        ob.setOption('newOpt', 2);
        expectOutput(ob, Object.assign({ newOpt: 2 }, defaultOptions));
    });

    test('Modifying option should not modify default', () => {
        const defaultOptionsShort = { test: 'initialVal' },
            ob = new OptionsBuilder(defaultOptionsShort);
        ob.setOption('test', 2);
        expectOutput(ob, { test: 2 });
        expect(defaultOptionsShort).toEqual({ test: 'initialVal' });
    });

    test('Set nested option', () => {
        const ob = new OptionsBuilder(defaultOptions);
        ob.setOption('newOpt.nest1.nest2.nest3', ['str']);
        ob.setOption('newOpt.nest1.added', 42);
        expectOutput(ob, Object.assign({
            newOpt: {
                nest1: {
                    nest2: {
                        nest3: ['str']
                    },
                    added: 42
                }
            }
        }, defaultOptions));
    });

    test('Modifying nested option should not modify default', () => {
        const defaultOptionsFactory = () => ({
                a: { b: { c: { d: 'initialVal' } } }
            }),
            defaultOpts = defaultOptionsFactory(),
            ob = new OptionsBuilder(defaultOpts);
        ob.setOption('a.b.c.newVal', 2);
        expect(defaultOpts).toEqual(defaultOptionsFactory());
    });
});