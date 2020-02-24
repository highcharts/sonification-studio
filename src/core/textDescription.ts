
function getNumericalColumn(columnData: Array<string>) {
    const numerical: Array<number> = [];
    let lastValueIx = 0;

    for (const cell of columnData) {
        if (cell === null || !cell.trim()) {
            numerical.push(null);
        } else {
            if (isNaN(cell as any)) {
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
    const rowsWithData = columnData.filter((cell): boolean => !!cell.trim());
    const numRows = rowsWithData.length;

    if (!numRows) {
        return 'Column is empty.';
    }

    return `Column contains category data with ${numRows} ${numRows === 1 ? 'row' : 'rows'}`;
}


function describeNumericalColumn(columnData: Array<number>): string {
    const rowsWithData = columnData.filter((cell): boolean => cell !== null);
    const numRows = rowsWithData.length;

    return `Column contains numerical data with ${numRows} ${numRows === 1 ? 'row' : 'rows'}`;
}


/**
 * Create text description for a column with data.
 */
export function describeColumn(columnData: Array<string>): string {
    const numerical = getNumericalColumn(columnData);
    return numerical ? describeNumericalColumn(numerical) : describeStringColumn(columnData);
}
