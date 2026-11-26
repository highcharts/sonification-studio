import { beforeEach, describe, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { describeTable } from '../../src/app/editor/core/textDescription';
import { useDataStore } from '../../src/app/editor/store/modules/data';

describe('describeTable', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('Describes an imported CSV with empty cells, by the column headers', () => {
        const store = useDataStore();
        store.loadFromCSV('Month,Sales,Note\nJan,10,ok\nFeb,12,\nMar,9,late\nApr,,\nMay,15,ok');

        expect(describeTable(store.tableRowData, store.tableColumnNamesWithData)).toBe([
            'Month: Column contains category data with 5 rows',
            'Sales: Column contains numerical data with 4 rows. The first value is 10 and ' +
                'the last value is 15. Minimum: 9, maximum: 15. The average is 11.50.',
            'Note: Column contains category data with 3 rows'
        ].join('\n'));
    });

    test('Describes the placeholder data as numbers', () => {
        const store = useDataStore();
        store.setToPlaceholderData();

        const description = describeTable(store.tableRowData, store.tableColumnNamesWithData);
        expect(description.split('\n')).toEqual([
            'Index (X value): Column contains numerical data with 199 rows. The first value is 0 and ' +
                'the last value is 198. Minimum: 0, maximum: 198. The average is 99.',
            expect.stringMatching(/^Sensor Data \(Y value\): Column contains numerical data with 199 rows\./)
        ]);
    });

    test('Names a column without a header by its id', () => {
        expect(describeTable([
            { A: 'Name', B: '' },
            { A: 'x', B: ' 2 ' },
            { A: 'y', B: '4' }
        ], ['A', 'B'])).toBe([
            'Name: Column contains category data with 2 rows',
            'B: Column contains numerical data with 2 rows. The first value is 2 and ' +
                'the last value is 4. Minimum: 2, maximum: 4. The average is 3.'
        ].join('\n'));
    });

    test('Describes every row without a header row, as with numbers from a project file', () => {
        expect(describeTable([
            { A: 1, B: '' },
            { A: 2, B: null },
            { A: 3 }
        ], ['A', 'B'])).toBe([
            'A: Column contains numerical data with 3 rows. The first value is 1 and ' +
                'the last value is 3. Minimum: 1, maximum: 3. The average is 2.',
            'B: Column is empty.'
        ].join('\n'));
    });
});
