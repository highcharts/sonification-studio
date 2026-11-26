/*
    Data handling and options for the data grid (Grid.vue), kept free of Vue
    and the Grid Pro runtime so it can be unit tested.

    The store keeps the table as an array of row objects keyed by column id
    (A-Z, then COL1, COL2, ...). Its first row holds the CSV headers, which
    the grid shows as secondary column headers, not as a data row. The grid
    gets the other rows as column arrays, with values converted to the
    detected column types. Edits in the grid are written back to the store's
    rows as text.
 */

import type { Column, DataTable, Grid, Options } from '@highcharts/grid-pro/grid-pro';
import type { CellEvent } from '@highcharts/grid-pro/es-modules/Data/DataTable';
// Adds the `gridKey` option to the Grid Pro options type, which the main
// Grid Pro typings leave out
import type {} from '@highcharts/grid-pro/es-modules/Grid/Pro/License/LicenseValidationComposition';
import type { TableRow } from '../../store/modules/data';

export type GridColumnDataType = Column['dataType'];
export type GridCellValue = string | number | boolean | null | undefined;
// A row of the data store's table
export type TableRowData = TableRow;

export interface GridTableData {
    // Ids of the columns shown in the grid, in order
    columnIds: string[];
    // CSV header row, shown in the column headers. Empty if there is none.
    headerRow: TableRowData;
    // Index of the store row shown as the grid's first row (1 when the
    // first store row is the CSV header row)
    firstDataRowIndex: number;
    // Grid data, as column arrays
    columns: Record<string, GridCellValue[]>;
    dataTypes: Record<string, GridColumnDataType>;
    // Number of consecutive text columns from the left
    headerColumnCount: number;
}

export interface CellEdit {
    // Index of the edited row in the store's rows
    rowIndex: number;
    columnId: string;
    value: string;
}

const maxColumnCount = 50;
// Empty columns shown after the last column with data
const extraColumnCount = 5;

// Column ids used by the grid: A-Z, then COL1, COL2, ..., the keys the store
// gives the columns of an imported CSV (loadFromCSV in the data store).
export function getGridColumnIds(count: number): string[] {
    return Array.from(
        { length: count },
        (_, i) => i < 26 ? String.fromCharCode(65 + i) : `COL${i - 25}`
    );
}

// The first store row holds the CSV headers when all its values are text.
export function isHeaderRow(row?: TableRowData): boolean {
    return Object.values(row || {}).every((value) => typeof value === 'string');
}

function isEmpty(value: unknown): boolean {
    return value === '' || value === null || value === void 0;
}

function toGridCellValue(value: unknown): GridCellValue {
    if (value === void 0 || value === null) {
        return '';
    }
    return typeof value === 'string' || typeof value === 'number' ||
        typeof value === 'boolean' ? value : String(value);
}

// Date.parse() also accepts text that only ends in a number ("Item 1" is
// January 2001 in Chrome), so a date must also have a year or a full
// day/month/year.
function looksLikeDate(value: string): boolean {
    return /\d{4}|\d{1,2}[/.-]\d{1,2}[/.-]\d{2}/.test(value) &&
        !isNaN(Date.parse(value));
}

// Detect how many consecutive columns from the left contain header-like data (mostly strings/text)
export function detectHeaderColumnCount(rows: TableRowData[], columnIds: string[]): number {
    if (!rows.length || !columnIds.length) return 0;

    const sampleSize = Math.min(10, rows.length); // Check first 10 rows or all if less
    let headerColumnCount = 0;

    // Check each column from left to right
    for (let colIndex = 0; colIndex < columnIds.length; colIndex++) {
        const key = columnIds[colIndex];
        let stringCount = 0;

        // Sample cells in this column
        for (let rowIndex = 0; rowIndex < sampleSize; rowIndex++) {
            const value = rows[rowIndex][key];

            // Check if it's a non-numeric string (likely header text)
            if (typeof value === 'string' && value.trim() !== '' && isNaN(Number(value))) {
                stringCount++;
            }
        }

        // If more than 70% of cells in this column are non-numeric strings, it's a header column
        if ((stringCount / sampleSize) > 0.7) {
            headerColumnCount = colIndex + 1;
        } else {
            // Stop at first non-header column (we only want consecutive header columns from the left)
            break;
        }
    }

    return headerColumnCount;
}

// Detect the data type of a column, so the grid sorts and filters it by
// value, not as text.
export function detectColumnDataType(columnData: GridCellValue[]): GridColumnDataType {
    let numericCount = 0;
    let dateCount = 0;
    let booleanCount = 0;
    let totalNonEmpty = 0;

    columnData.forEach((value) => {
        if (isEmpty(value)) {
            return;
        }
        totalNonEmpty++;

        const numValue = Number(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
            numericCount++;
        }
        if (typeof value === 'boolean' || value === 'true' || value === 'false') {
            booleanCount++;
        }
        if (typeof value === 'string' && looksLikeDate(value)) {
            dateCount++;
        }
    });

    if (totalNonEmpty === 0) return 'string';

    // Determine data type based on majority (>80% threshold)
    const threshold = 0.8;
    if ((numericCount / totalNonEmpty) > threshold) {
        return 'number';
    } else if ((booleanCount / totalNonEmpty) > threshold) {
        return 'boolean';
    } else if ((dateCount / totalNonEmpty) > threshold) {
        return 'datetime';
    }

    return 'string';
}

// Convert column data to the detected type. Dates are kept as text: the grid
// shows them as written in the CSV and sorts them with compareDates().
export function convertColumnData(
    columnData: GridCellValue[],
    dataType: GridColumnDataType
): GridCellValue[] {
    if (dataType === 'number') {
        return columnData.map((value) => {
            if (isEmpty(value)) return value;
            const numValue = Number(value);
            return !isNaN(numValue) && isFinite(numValue) ? numValue : value;
        });
    }
    if (dataType === 'boolean') {
        return columnData.map((value) => {
            if (value === 'true') return true;
            if (value === 'false') return false;
            return value;
        });
    }
    return columnData;
}

// Sort comparison for date columns. Empty and unparsable values sort as 0,
// like the grid's own comparison does.
export function compareDates(a: GridCellValue, b: GridCellValue): number {
    const time = (value: GridCellValue) => Date.parse(String(value ?? '')) || 0;
    return time(a) - time(b);
}

// Number of columns the rows use: the highest grid column id in any row, or
// the number of values in a row with other keys.
function getUsedColumnCount(rows: TableRowData[], columnIds: string[]): number {
    let count = 0;
    for (const row of rows) {
        const keys = Object.keys(row);
        count = Math.max(count, keys.length);
        for (const key of keys) {
            count = Math.max(count, columnIds.indexOf(key) + 1);
        }
    }
    return count;
}

// Prepare the store's rows for the grid.
export function prepareGridData(rows: TableRowData[]): GridTableData {
    const hasHeaderRow = isHeaderRow(rows[0]);
    const headerRow = hasHeaderRow ? rows[0] || {} : {};
    const firstDataRowIndex = hasHeaderRow ? 1 : 0;
    const bodyRows = rows.slice(firstDataRowIndex);

    const columnCount = Math.min(
        maxColumnCount,
        getUsedColumnCount(rows, getGridColumnIds(maxColumnCount)) + extraColumnCount
    );
    const columnIds = getGridColumnIds(columnCount);

    const columns: Record<string, GridCellValue[]> = {};
    const dataTypes: Record<string, GridColumnDataType> = {};

    columnIds.forEach((id) => {
        const columnData = bodyRows.map((row) => toGridCellValue(row[id]));
        const nonEmptyCount = columnData.filter((value) => !isEmpty(value)).length;

        // Only detect the type of columns with some data
        const dataType = nonEmptyCount > 5 ? detectColumnDataType(columnData) : 'string';
        dataTypes[id] = dataType;
        columns[id] = convertColumnData(columnData, dataType);
    });

    return {
        columnIds,
        headerRow,
        firstDataRowIndex,
        columns,
        dataTypes,
        headerColumnCount: detectHeaderColumnCount(bodyRows, columnIds)
    };
}

// Convert a grid cell value to the text stored in the store's rows.
export function toStoreValue(value: GridCellValue): string {
    return value === null || value === void 0 ? '' : String(value);
}

// Call onEdit with each cell edited in the grid, until the returned function
// is called. `table` is the grid's original data table (not the sorted and
// filtered one), whose rows are the store's rows from firstDataRowIndex on.
//
// Grid Pro writes an edit to this table at the row's original index, then
// sorts and filters the rows again and only then fires the cell's afterEdit
// event, when the cell may show another row. So the edit is taken from the
// table's afterSetCell event instead, which Grid Pro marks as coming from the
// grid.
export function onGridCellEdit(
    table: DataTable,
    firstDataRowIndex: number,
    onEdit: (edit: CellEdit) => void
): () => void {
    // The event is typed here, as Grid Pro's typings resolve it to `never`
    // for 'afterSetCell' (its CellEvent type covers 'setCell' as well).
    const removeListener = table.on('afterSetCell', (e: CellEvent) => {
        if (!e.detail?.fromGrid) {
            return;
        }
        onEdit({
            rowIndex: firstDataRowIndex + e.rowIndex,
            columnId: e.columnId,
            value: toStoreValue(e.cellValue)
        });
    });
    // Grid Pro types the returned remover as Function
    return removeListener as () => void;
}

// A grid's data table: the original one, or with `presentation`, the rows as
// shown, after sorting and filtering.
export function getGridDataTable(grid: Grid, presentation = false): DataTable | undefined {
    const dataProvider = grid.dataProvider;
    return dataProvider && 'getDataTable' in dataProvider ?
        dataProvider.getDataTable(presentation) :
        void 0;
}

// Data store actions that change the grid's data: CSV imports (loadFromCSV
// calls setTableRowData), added rows, filled columns, a cleared grid, a new
// project and a loaded project file, and the grid's own edits
const gridDataActions = [
    'setTableRowData',
    'addTableRows',
    'fillColumn',
    'restoreStoreState'
];

export interface GridState {
    // The action is the grid's own edit
    isUpdatingFromGrid: boolean;
    // The grid has been rendered. Until then, it is rendered with the latest
    // data when it first becomes visible.
    hasRendered: boolean;
    // The Data tab is shown
    onDataTab: boolean;
}

// Whether a data store action (by name) rebuilds the grid now, when the Data
// tab is next shown ('later'), or not at all
export function getGridRebuild(actionName: string, state: GridState): 'now' | 'later' | 'none' {
    if (
        !gridDataActions.includes(actionName) ||
        state.isUpdatingFromGrid ||
        !state.hasRendered
    ) {
        return 'none';
    }
    return state.onDataTab ? 'now' : 'later';
}

// The edit mode renderer of number columns, registered by gridProSetup.ts:
// Grid Pro's number input, but a cleared cell stays empty instead of 0.
export const clearableNumberInputType = 'clearableNumberInput';

// Text as HTML that parses back to the text. Quotes are escaped too, as
// Highcharts' HTML parser rewrites ' style="' in the markup it is given.
function escapeHTML(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// The CSV header of a column, if it has one
function getCSVHeader(headerRow: TableRowData, columnId: string): string | undefined {
    const value = headerRow[columnId];
    return typeof value === 'string' && value.trim() !== '' ? value : void 0;
}

// The grid's options for the data. `gridKey` is the optional Grid Key.
export function getGridOptions(tableData: GridTableData, gridKey?: string): Options {
    const { columnIds, dataTypes, headerColumnCount, headerRow } = tableData;

    // A, B, C, ... as primary headers, and the CSV headers as secondary
    // headers below them
    const header: NonNullable<Options['header']> = columnIds.map((id) => {
        const csvHeader = getCSVHeader(headerRow, id);

        if (csvHeader) {
            return {
                format: id,
                className: 'hcg-center',
                columns: [{
                    // The text is set by the column's header options
                    columnId: id,
                    className: 'hcg-center',
                    // Grid Pro labels the cell with the column id only, so
                    // screen readers get the CSV header as its description.
                    accessibility: { description: csvHeader }
                }]
            };
        }
        return {
            columnId: id,
            format: id,
            className: 'hcg-center'
        };
    });

    const columns: NonNullable<Options['columns']> = columnIds.map((id, index) => {
        const csvHeader = getCSVHeader(headerRow, id);
        const column: NonNullable<Options['columns']>[number] = {
            id,
            dataType: dataTypes[id],
            cells: {
                className: index < headerColumnCount ?
                    'hcg-center hcg-header-column' :
                    'hcg-center'
            }
        };

        // The CSV header as written. As a header format, "{...}" would be
        // taken as a template expression. Grid Pro renders a header value
        // that contains "<" as HTML, and one without as text, so the
        // formatter gives the header escaped in a <span>: parsed as HTML,
        // it renders as the header's text, with no tag or attribute for
        // Grid Pro to warn about (Highcharts warning #33). The sort and
        // column menu buttons are labelled with that text. The filter and
        // column menu popups show the header cell's value as text, so after
        // rendering the value is set to the CSV header, as is the text
        // (dropping the <span>).
        if (csvHeader) {
            column.header = {
                formatter: () => '<span>' + escapeHTML(csvHeader) + '</span>',
                events: {
                    afterRender: function () {
                        if (this.header) {
                            this.header.value = csvHeader;
                        }
                        if (this.header?.headerContent) {
                            this.header.headerContent.textContent = csvHeader;
                        }
                    }
                }
            };
        }

        if (dataTypes[id] === 'number') {
            column.cells = {
                ...column.cells,
                editMode: { renderer: { type: clearableNumberInputType } }
            };
        }

        // Dates are shown as written in the CSV, and sorted by date
        if (dataTypes[id] === 'datetime') {
            column.dataType = 'string';
            column.sorting = { compare: compareDates };
        }
        return column;
    });

    return {
        gridKey,
        data: {
            columns: tableData.columns
        },
        header,
        columnDefaults: {
            width: 200,
            cells: {
                editMode: {
                    enabled: true
                },
                className: 'hcg-center',
                // Show values as they are, as Grid Pro 2 did (Grid Pro 3 adds
                // thousands separators to numbers)
                format: '{value}'
            },
            header: {
                className: 'hcg-center'
            },
            sorting: {
                enabled: true
            },
            filtering: {
                enabled: true
            }
        },
        rendering: {
            theme: 'hcg-theme-default',
            rows: {
                virtualization: true,
                bufferSize: 20, // Increased buffer for smoother scrolling
                strictHeights: true // Enable for better virtualization performance
            },
            columns: {
                // Keep all columns (at most 50) in the DOM, as Grid Pro 2
                // did. Grid Pro 3 virtualizes from 20 columns.
                virtualization: false,
                resizing: {
                    // Resizing a column changes only its width, so the table
                    // scrolls horizontally instead of squeezing the other
                    // columns.
                    mode: 'independent'
                }
            }
        },
        columns
    };
}

// Return the store's rows with an edited cell. Every row gets a value (or '')
// for each grid column up to the last one in use, in column order, so the
// values line up in the CSV generated from the rows. Other keys in a row are
// kept after these.
export function applyCellEdit(
    rows: TableRowData[],
    edit: CellEdit,
    columnIds: string[]
): TableRowData[] {
    let lastColumnIndex = columnIds.indexOf(edit.columnId);
    for (const row of rows) {
        for (const key of Object.keys(row)) {
            lastColumnIndex = Math.max(lastColumnIndex, columnIds.indexOf(key));
        }
    }
    const usedColumnIds = columnIds.slice(0, lastColumnIndex + 1);

    const normalizeRow = (row: TableRowData): TableRowData => {
        const newRow: TableRowData = {};
        for (const id of usedColumnIds) {
            newRow[id] = row[id] ?? '';
        }
        for (const key of Object.keys(row)) {
            if (!(key in newRow)) {
                newRow[key] = row[key];
            }
        }
        return newRow;
    };

    const newRows = rows.map(normalizeRow);
    while (newRows.length <= edit.rowIndex) {
        newRows.push(normalizeRow({}));
    }
    newRows[edit.rowIndex][edit.columnId] = edit.value;

    return newRows;
}
