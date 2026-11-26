import { describe, expect, test } from 'vitest';
import { parseCSV } from '../../../src/app/editor/core/utils/csvParser';

describe('parseCSV', () => {
    test('Gives no rows for an empty CSV', () => {
        expect(parseCSV('')).toEqual([]);
        expect(parseCSV('', ',')).toEqual([]);
    });

    test('Parses rows of values', () => {
        expect(parseCSV('a;b\n1;2\r\n3;4')).toEqual([['a', 'b'], ['1', '2'], ['3', '4']]);
        expect(parseCSV('a,b\n1,2', ',')).toEqual([['a', 'b'], ['1', '2']]);
        expect(parseCSV(';b\n1;')).toEqual([['', 'b'], ['1', '']]);
    });

    test('Reads quoted values', () => {
        expect(parseCSV('"Temp; C";"Say ""hi""";"""";"a\nb"\n1;2;3;4')).toEqual([
            ['Temp; C', 'Say "hi"', '"', 'a\nb'],
            ['1', '2', '3', '4']
        ]);
    });

    test('Ends on a quote that is never closed at the start', () => {
        // The unquoted text up to the next delimiter is left out
        expect(parseCSV('"a;b')).toEqual([['', 'b']]);
        expect(parseCSV('"a\n1;2')).toEqual([[''], ['1', '2']]);
    });
});
