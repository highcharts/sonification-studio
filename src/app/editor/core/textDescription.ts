import type { TableCellValue, TableRow } from '../store/modules/data';
import { isHeaderRow } from './utils/gridData';

function removeRedundantNumberPrecision(str: string): string {
    return str.replace(/\.0+(\D)/g, '$1');
}


// The text of a cell, trimmed. Empty for a missing cell (the rows of an
// imported CSV leave out empty cells) or null. Project files may hold numbers.
function getCellText(cell: TableCellValue | undefined): string {
    return cell === null || cell === undefined ? '' : String(cell).trim();
}


function getNumericalColumn(columnData: Array<string>) {
    const numerical: Array<number|null> = [];
    let lastValueIx = 0;

    for (const cell of columnData) {
        if (!cell) {
            numerical.push(null);
        } else {
            if (isNaN(Number(cell))) {
                return null;
            }
            lastValueIx = numerical.push(parseFloat(cell));
        }
    }

    if (!lastValueIx) {
        return null;
    }

    return numerical.slice(0, lastValueIx);
}


function describeStringColumn(columnData: Array<string>): string {
    const rowsWithData = columnData.filter((cell): boolean => !!cell);
    const numRows = rowsWithData.length;

    if (!numRows) {
        return 'Column is empty.';
    }

    return `Column contains category data with ${numRows} ${numRows === 1 ? 'row' : 'rows'}`;
}


function describeNumericalColumn(columnData: Array<number|null>): string {
    const rowsWithData = columnData.filter((cell): boolean => cell !== null) as number[];
    const numRows = rowsWithData.length;
    const valToPrecision = (x: number): string => x.toPrecision(4);
    const minVal = Math.min(...rowsWithData);
    const maxVal = Math.max(...rowsWithData);
    const avgVal = rowsWithData.reduce((a, b) => a + b, 0) / numRows;
    const numRowsDescription =
        `Column contains numerical data with ${numRows} ${numRows === 1 ? 'row' : 'rows'}`;
    const firstLastDescription =
        `The first value is ${rowsWithData[0]} and the last value is ${rowsWithData[numRows - 1]}`;
    const minMaxDescription =
        `Minimum: ${valToPrecision(minVal)}, maximum: ${valToPrecision(maxVal)}`;
    const avgDescription =
        `The average is ${valToPrecision(avgVal)}`;

    return removeRedundantNumberPrecision([
        numRowsDescription,
        firstLastDescription,
        minMaxDescription,
        avgDescription
    ].join('. ') + '.');
}


/**
 * Create a text description of the table's columns with the given ids. When
 * the first row holds the CSV headers (as the grid and the chart take it), a
 * column is named by its header, and the header is not described as data.
 */
export function describeTable(rows: TableRow[], columnIds: string[]): string {
    const hasHeaderRow = isHeaderRow(rows[0]);
    const headerRow = hasHeaderRow ? rows[0] : {};
    const dataRows = hasHeaderRow ? rows.slice(1) : rows;

    return columnIds.map((columnId) => {
        const columnData = dataRows.map((row) => getCellText(row[columnId]));
        const numerical = getNumericalColumn(columnData);
        const columnDesc = numerical ? describeNumericalColumn(numerical) : describeStringColumn(columnData);
        const columnName = getCellText(headerRow[columnId]) || columnId;
        return columnName + ': ' + columnDesc;
    }).join('\n');
}
