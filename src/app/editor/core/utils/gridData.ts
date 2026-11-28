/*
    Data handling and options for the data grid (Grid.vue), kept free of Vue
    and the Grid Pro runtime so it can be unit tested.

    The store keeps the table as an array of row objects keyed by column id
    (A to Z, then AA, AB, ..., as in spreadsheets). Its first row holds the
    CSV headers, which the grid shows as secondary column headers, not as a
    data row. The grid shows the columns up to the last one with a value, and
    a few empty ones after it to add data in (getGridColumnCount). The grid
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
import { escapeHTML } from './htmlText';

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

// The grid shows at least the columns A to K, and at most 50 (A to AX).
const minGridColumnCount = 11;
export const maxGridColumnCount = 50;
// Empty columns shown after the last column with a value, to add data in
const spareColumnCount = 5;

// The id of the column at an index: A to Z, then AA, AB, ..., AZ, BA, ...,
// ZZ, AAA, ..., as in spreadsheets. The store keys the rows' cells by these
// ids, and the grid's columns have them.
export function getColumnId(index: number): string {
    let id = '';
    for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
        id = String.fromCharCode(65 + (n - 1) % 26) + id;
    }
    return id;
}

// The ids of the first `count` columns
export function getGridColumnIds(count: number): string[] {
    return Array.from({ length: count }, (_, i) => getColumnId(i));
}

// Index of a column id ('A' is 0, 'Z' 25, 'AA' 26, ...), or -1 for another
// key. Ids have as many letters as getColumnId gives them (AAAA is the
// 18279th column, of a CSV that wide).
export function getColumnIndex(columnId: string): number {
    if (!/^[A-Z]+$/.test(columnId)) {
        return -1;
    }
    let n = 0;
    for (const letter of columnId) {
        n = n * 26 + letter.charCodeAt(0) - 64;
    }
    return n - 1;
}

const legacyColumnIdPattern = /^COL([1-9]\d*)$/;

// Rows with the column ids of projects and sessions saved before the columns
// past Z were named AA, AB, ... (v1.2.1 and earlier), renamed to them. Only
// for rows saved without the data store's columnIdsVersion: the current ids
// can look like the older ones.
// - COL1, COL2, ...: the columns past Z of an imported CSV, and of the grid
//   in v1.2.0 and v1.2.1.
// - AA, BA, CA, ...: the columns past Z of the grid in master v1.1.1, which
//   gave each row it wrote a cell in each of its columns. Such rows have no
//   other ids of two letters, and a row has cells in A to Z and BA. The
//   versions without columnIdsVersion gave no other columns these ids.
// A COL id's value wins over another for the same column, as in v1.2.1 (its
// rowToCSV put a value under another key after the columns). Rows without
// these ids are returned as they are.
export function renameLegacyColumnIds(rows: TableRowData[]): TableRowData[] {
    const keys = new Set(rows.flatMap((row) => Object.keys(row)));
    const hasCOLIds = [...keys].some((key) => legacyColumnIdPattern.test(key));
    const twoLetterIds = [...keys].filter((key) => /^[A-Z]{2}$/.test(key));
    const hasV111GridIds = twoLetterIds.includes('BA') &&
        twoLetterIds.every((key) => key[1] === 'A') &&
        rows.some((row) => ['BA', ...getGridColumnIds(26)].every((id) => id in row));
    if (!hasCOLIds && !hasV111GridIds) {
        return rows;
    }

    const getNewId = (key: string): string => {
        const match = legacyColumnIdPattern.exec(key);
        if (match) {
            return getColumnId(25 + Number(match[1]));
        }
        if (hasV111GridIds && /^[A-Z]A$/.test(key)) {
            return getColumnId(26 + key.charCodeAt(0) - 65);
        }
        return key;
    };
    return rows.map((row) => {
        const newRow: TableRowData = {};
        for (const [key, value] of Object.entries(row)) {
            const newId = getNewId(key);
            if (!(newId in newRow) || legacyColumnIdPattern.test(key)) {
                newRow[newId] = value;
            }
        }
        return newRow;
    });
}

// The number of columns the grid shows: up to the last column with a value
// (a CSV header counts), and spareColumnCount empty columns after it to add
// data in, but at least A to K and at most maxGridColumnCount. Empty cells
// do not count, such as the ones in C to Z that projects started from the
// placeholder data of v1.1.1 to v1.2.1 have.
export function getGridColumnCount(rows: TableRowData[]): number {
    let lastIndexWithValue = -1;
    for (const row of rows) {
        for (const [key, value] of Object.entries(row)) {
            if (hasValue(value)) {
                lastIndexWithValue = Math.max(lastIndexWithValue, getColumnIndex(key));
            }
        }
    }
    return Math.min(
        maxGridColumnCount,
        Math.max(minGridColumnCount, lastIndexWithValue + 1 + spareColumnCount)
    );
}

// The ids of the columns that get a series in the chart: the columns a row
// after the first (the series names) has a cell in, up to the last column
// that has a value. The series ids go by series index (getSeriesId), so the
// series settings stay with their columns as long as this set does not change:
// - Rows loaded from a CSV (imported, or by master v1.1.1 after a project or
//   session was loaded) have no cells for empty values. A column without
//   cells gets no series, as in master v1.1.1, whose saved settings of the
//   columns after it go by the series that leave it out.
// - Rows edited in the grid keep the cells they have (applyCellEdit), and
//   rows are saved and loaded as they are, so a column emptied in the grid
//   keeps its (hidden) series while a later column has values.
// - Columns of empty cells after the last value (as the C to Z of projects
//   started from the placeholder data of v1.1.1 to v1.2.1) get none, so they
//   do not show as empty series.
export function getSeriesColumnIds(rows: TableRowData[]): Set<string> {
    const withCells = new Set<string>();
    let lastIndexWithValue = -1;
    for (const row of rows.slice(1)) {
        for (const [key, value] of Object.entries(row)) {
            withCells.add(key);
            if (hasValue(value)) {
                lastIndexWithValue = Math.max(lastIndexWithValue, getColumnIndex(key));
            }
        }
    }
    return new Set([...withCells].filter((key) => getColumnIndex(key) <= lastIndexWithValue));
}

// The first store row holds the CSV headers when all its values are text.
export function isHeaderRow(row?: TableRowData): boolean {
    return Object.values(row || {}).every((value) => typeof value === 'string');
}

function isEmpty(value: unknown): boolean {
    return value === '' || value === null || value === void 0;
}

// A value that is not empty or blanks only
function hasValue(value: unknown): boolean {
    return !isEmpty(value) && String(value).trim() !== '';
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

// Prepare the store's rows for the grid.
export function prepareGridData(rows: TableRowData[]): GridTableData {
    const hasHeaderRow = isHeaderRow(rows[0]);
    const headerRow = hasHeaderRow ? rows[0] || {} : {};
    const firstDataRowIndex = hasHeaderRow ? 1 : 0;
    const bodyRows = rows.slice(firstDataRowIndex);

    const columnIds = getGridColumnIds(getGridColumnCount(rows));

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

// The accessible name of a cell's editor input: its column, with the column's
// CSV header if it has one, and its row in the grid (1 for the first row
// shown)
export function getCellEditorLabel(
    columnId: string,
    csvHeader: string | undefined,
    rowNumber: number | undefined
): string {
    return ['Column ' + columnId, csvHeader, rowNumber === void 0 ? void 0 : 'row ' + rowNumber]
        .filter(Boolean)
        .join(', ');
}

// The CSV header of a column, if it has one
function getCSVHeader(headerRow: TableRowData, columnId: string): string | undefined {
    const value = headerRow[columnId];
    return typeof value === 'string' && value.trim() !== '' ? value : void 0;
}

// The grid's options for the data. `gridKey` is the optional Grid Key.
// `afterEdit` is called after a cell's edit is done: after it is written to
// the grid's data table and the rows are sorted and filtered again.
export function getGridOptions(
    tableData: GridTableData,
    gridKey?: string,
    afterEdit?: () => void
): Options {
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
                    // The text and the label are set by the column's header
                    // options
                    columnId: id,
                    className: 'hcg-center'
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
        // (dropping the <span>). Grid Pro labels the header cell with the
        // column id, which screen readers would read instead of the header
        // shown, so it is labelled with the CSV header (the column id is in
        // the header cell above it).
        if (csvHeader) {
            column.header = {
                formatter: () => '<span>' + escapeHTML(csvHeader) + '</span>',
                events: {
                    afterRender: function () {
                        if (this.header) {
                            this.header.value = csvHeader;
                            this.header.htmlElement.setAttribute('aria-label', csvHeader);
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
                ...(afterEdit && { events: { afterEdit: () => afterEdit() } }),
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

// Return the store's rows with an edited cell: only that cell changes, and a
// row is added for it if needed. The CSV generated from the rows keeps each
// value in its column (rowToCSV in the data store), so a row needs no cells
// for its empty values. Giving the rows such cells would give a column that no
// row has a cell in a series in the chart, and so give the series settings of
// the columns after it to other columns (see buildChartOptions in
// ChartBridge). Other keys in a row are kept.
export function applyCellEdit(rows: TableRowData[], edit: CellEdit): TableRowData[] {
    const newRows = rows.slice();
    while (newRows.length <= edit.rowIndex) {
        newRows.push({});
    }
    newRows[edit.rowIndex] = { ...newRows[edit.rowIndex], [edit.columnId]: edit.value };
    return newRows;
}
