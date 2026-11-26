import { describe, expect, test } from 'vitest';
import {
    getGoogleSheetsErrorMessage,
    removeNonNumericYValues
} from '../../../src/app/editor/core/utils/chartUtils';

describe('removeNonNumericYValues tests', () => {
    test('Replaces text y values with null', () => {
        expect(removeNonNumericYValues([[1, 'Item 1'], [2, 5], [3, 'n/a']]))
            .toEqual([[1, null], [2, 5], [3, null]]);
    });

    test('Keeps text x values, which become point names', () => {
        expect(removeNonNumericYValues([['Item 1', 5], ['Item 2', null]]))
            .toEqual([['Item 1', 5], ['Item 2', null]]);
    });

    test('Handles single values and point objects', () => {
        expect(removeNonNumericYValues([4, 'text', null, [6], ['text']]))
            .toEqual([4, null, null, [6], [null]]);
        expect(removeNonNumericYValues([{ x: 1, y: 'text' }, { x: 2, y: 3 }]))
            .toEqual([{ x: 1, y: null }, { x: 2, y: 3 }]);
    });
});

describe('getGoogleSheetsErrorMessage tests', () => {
    test('Returns the Google Sheets API message of a failed request', () => {
        const response = JSON.stringify({
            error: {
                code: 400,
                message: 'API key not valid. Please pass a valid API key.',
                status: 'INVALID_ARGUMENT'
            }
        });
        expect(getGoogleSheetsErrorMessage('Request failed - 400 \n' + response))
            .toBe('API key not valid. Please pass a valid API key.');
    });

    test('Falls back for a response without a message', () => {
        expect(getGoogleSheetsErrorMessage('Request failed - 0 \n'))
            .toBe('Unknown error');
        expect(getGoogleSheetsErrorMessage('Request failed - 500 \n{"error":{}}'))
            .toBe('Unknown error');
    });

    test('Ignores other Highcharts errors', () => {
        expect(getGoogleSheetsErrorMessage(
            'Highcharts warning #13: www.highcharts.com/errors/13/'
        )).toBeNull();
        expect(getGoogleSheetsErrorMessage('Invalid URL: https://example.com'))
            .toBeNull();
    });
});
