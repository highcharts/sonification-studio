import { describe, expect, test } from 'vitest';
import { getGoogleSheetsErrorMessage } from '../../../src/app/editor/core/utils/chartUtils';

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
