/*
    Additions to Grid Pro for the data grid (Grid.vue). Import this module
    before creating the grid.
*/

import * as GridPro from '@highcharts/grid-pro/grid-pro';
import type { CellRendererOptions } from '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/CellRenderer';
import type { NumberInputRendererOptions } from '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/Renderers/NumberInputRenderer';
import type { TableBodySection } from '@highcharts/grid-pro/es-modules/Grid/Core/Table/Table';
import { clearableNumberInputType, getCellEditorLabel } from './utils/gridData';

const { numberInput: NumberInputRenderer } = GridPro.CellRendererRegistry.types;

interface ClearableNumberInputRendererOptions extends Omit<NumberInputRendererOptions, 'type'> {
    type: typeof clearableNumberInputType;
}

// The edit mode renderer of number columns (see getGridOptions). Grid Pro's
// number input gives a cleared cell the value 0 (+''); this one renders the
// same input, but leaves a cleared cell empty, as the store and the chart
// have it. (Grid Pro's text input cannot clear a number cell: it gives it
// null, and the cell then keeps its old value.)
class ClearableNumberInputRenderer extends GridPro.CellRenderer {
    options: ClearableNumberInputRendererOptions;
    private readonly numberInput: InstanceType<typeof NumberInputRenderer>;

    constructor(column: GridPro.Column, options: Partial<CellRendererOptions>) {
        super(column);
        this.numberInput = new NumberInputRenderer(column, { ...options, type: 'numberInput' });
        this.options = { ...this.numberInput.options, type: clearableNumberInputType };
    }

    render(cell: GridPro.TableCell, parentElement?: HTMLElement) {
        const content = this.numberInput.render(cell, parentElement);
        Object.defineProperty(content, 'value', {
            configurable: true,
            get: () => content.rawValue === '' ? '' : Number(content.rawValue)
        });
        return content;
    }
}

declare module '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/CellRendererType' {
    interface CellRendererTypeRegistry {
        clearableNumberInput: typeof ClearableNumberInputRenderer;
    }
}

// Does nothing when the renderer is registered already (on a hot reload), so
// Grid Pro keeps the first version of the class: changes to it only apply
// after a full page reload.
GridPro.CellRendererRegistry.registerRenderer(clearableNumberInputType, ClearableNumberInputRenderer);

/*
    WORKAROUND for a Grid Pro 3.2.0 bug: remove it once Grid Pro is fixed
    (check: in a table of 2,000 rows, scrolled to the end, the last row's
    aria-rowindex is 2002, not ~35).

    With row virtualization only the rows around the visible ones are
    rendered. After each render of the rows, Table.syncAriaRowIndexes()
    numbers them by their position among the rendered rows, not by their
    index in the table, so after a scroll screen readers announce the rows
    on screen as rows 3, 4, ... This runs Grid Pro's method (which also sets
    aria-rowcount), then numbers the main body rows by their index in the
    (sorted and filtered) table, `row.index`, after the header rows and the
    rows of the body sections before them (pinned or summary rows), and the
    rows of the body sections after them from the end of the table. Grid
    Pro's numbers for the sections before the main body are right, and once
    it numbers all rows right, this gives the same numbers.

    Grid Pro 3.2 also sets the table's aria-rowcount two ways: when it renders
    the grid, to the number of body rows only (2000), and in
    syncAriaRowIndexes(), which runs only once the rows are rendered again
    (after a scroll), to the number including the header rows (2002), as
    aria-rowindex counts them. So Grid.vue calls syncAriaRowIndexes() once
    each grid has rendered (check, when removing this: the count is 2002 both
    before and after a scroll).
*/

// Grid Pro's typings mark the table's body sections private
interface TableWithBodySections {
    bodySections: TableBodySection[];
}

type SyncAriaRowIndexes = GridPro.Table['syncAriaRowIndexes'] & {
    // Set on the corrected method, so a hot reload does not wrap it again
    numbersRowsByIndex?: true;
};

const gridProSyncAriaRowIndexes: SyncAriaRowIndexes = GridPro.Table.prototype.syncAriaRowIndexes;

if (!gridProSyncAriaRowIndexes.numbersRowsByIndex) {
    const syncAriaRowIndexes: SyncAriaRowIndexes = async function (this: GridPro.Table): Promise<void> {
        await gridProSyncAriaRowIndexes.call(this);

        const a11y = this.grid.accessibility;
        if (!a11y) {
            return;
        }
        const bodySections = (this as unknown as TableWithBodySections).bodySections || [];
        const getSectionRows = (position: TableBodySection['position']) => bodySections
            .filter((section) => section.position === position)
            .flatMap((section) => section.getRows());

        // aria-rowindex is 1-based
        const firstBodyRowIndex = (this.header?.rows.length ?? 0) +
            getSectionRows('before').length + 1;
        for (const row of this.rows) {
            a11y.setRowIndex(row.htmlElement, firstBodyRowIndex + row.index);
        }

        const rowsAfter = getSectionRows('after');
        if (rowsAfter.length) {
            const rowCount = await this.grid.dataProvider?.getRowCount() || 0;
            rowsAfter.forEach((row, i) => {
                a11y.setRowIndex(row.htmlElement, firstBodyRowIndex + rowCount + i);
            });
        }
    };
    syncAriaRowIndexes.numbersRowsByIndex = true;
    GridPro.Table.prototype.syncAriaRowIndexes = syncAriaRowIndexes;
}

/*
    Keyboard navigation in the grid's body cells for the keys Grid Pro 3.2
    leaves to the browser: it scrolls the table, but the focus stays in the
    cell, which drops to the page when its row scrolls out of the rendered
    rows. These keys move the focus instead, as in the ARIA grid pattern,
    and the table scrolls to the focused cell:
    - Page Down, Page Up: a page of rows down or up, in the same column;
    - Home, End: the first or the last cell in the row;
    - Ctrl+Home, Ctrl+End: the first cell in the first row, or the last cell
      in the last row (also with Cmd on macOS).
*/

// The parts of Grid Pro's table and cells used here, which its typings mark
// internal
interface NavigableTable {
    columns: unknown[];
    tbodyElement: HTMLElement;
    rowsVirtualizer: { rowCount: number; defaultRowHeight: number };
    focusCellByRowIndex(rowIndex: number, columnIndex: number): void;
}

interface NavigableCell {
    htmlElement: HTMLElement;
    row: { index?: number; viewport: NavigableTable };
    column?: { index: number };
}

type CellKeyDown = ((this: NavigableCell, e: KeyboardEvent) => void) & {
    // Set on the wrapped handler, so a hot reload does not wrap it again
    handlesNavigationKeys?: true;
};

// The cell a key moves the focus to, as [row index, column index] in the
// table as shown (sorted and filtered), or undefined for other keys
export function getNavigationTarget(
    key: string,
    ctrlKey: boolean,
    position: { rowIndex: number; columnIndex: number },
    size: { rowCount: number; columnCount: number; pageRowCount: number }
): [number, number] | undefined {
    const { rowIndex, columnIndex } = position;
    const lastRow = size.rowCount - 1;
    const lastColumn = size.columnCount - 1;
    switch (key) {
    case 'PageDown':
        return [Math.min(rowIndex + size.pageRowCount, lastRow), columnIndex];
    case 'PageUp':
        return [Math.max(rowIndex - size.pageRowCount, 0), columnIndex];
    case 'Home':
        return ctrlKey ? [0, 0] : [rowIndex, 0];
    case 'End':
        return ctrlKey ? [lastRow, lastColumn] : [rowIndex, lastColumn];
    }
    return void 0;
}

const tableCellPrototype = GridPro.TableCell.prototype as unknown as { onKeyDown: CellKeyDown };
const gridProCellKeyDown = tableCellPrototype.onKeyDown;

if (!gridProCellKeyDown.handlesNavigationKeys) {
    const onKeyDown: CellKeyDown = function (this: NavigableCell, e: KeyboardEvent): void {
        const table = this.row.viewport;
        const rowIndex = this.row.index;
        const columnIndex = this.column?.index;
        const rowHeight = table.rowsVirtualizer.defaultRowHeight;
        const rowsInView = rowHeight > 0 ? Math.floor(table.tbodyElement.clientHeight / rowHeight) : 0;
        // Not in an input of the cell (in edit mode), nor with other
        // modifiers, which are the browser's or the screen reader's
        const target = e.target === this.htmlElement && !e.altKey && !e.shiftKey &&
            rowIndex !== void 0 && columnIndex !== void 0 &&
            getNavigationTarget(e.key, e.ctrlKey || e.metaKey, { rowIndex, columnIndex }, {
                rowCount: table.rowsVirtualizer.rowCount,
                columnCount: table.columns.length,
                // The rows in view, less one, so the focused row stays in view
                pageRowCount: Math.max(1, rowsInView - 1)
            });
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            table.focusCellByRowIndex(target[0], target[1]);
            return;
        }
        gridProCellKeyDown.call(this, e);
    };
    onKeyDown.handlesNavigationKeys = true;
    tableCellPrototype.onKeyDown = onKeyDown;
}

/*
    Name the cell editor's input for screen readers, which Grid Pro 3.2 gives
    no name: by its column (with the column's CSV header) and its row. The
    grid edits text with the text input, numbers with the number input (in
    ClearableNumberInputRenderer), and true/false values with the checkbox.
*/

interface EditorContent {
    getMainElement(): HTMLElement;
}

interface EditedCell {
    column: { id: string; header?: { value?: string } };
    row: { index?: number };
}

type EditorRender = ((this: unknown, cell: EditedCell, parentElement?: HTMLElement) => EditorContent) & {
    // Set on the wrapped method, so a hot reload does not wrap it again
    labelsEditor?: true;
};

for (const type of ['textInput', 'numberInput', 'checkbox'] as const) {
    const rendererPrototype = GridPro.CellRendererRegistry.types[type].prototype as unknown as {
        render: EditorRender;
    };
    const gridProRender = rendererPrototype.render;
    if (gridProRender.labelsEditor) {
        continue;
    }
    const render: EditorRender = function (this: unknown, cell, parentElement) {
        const content = gridProRender.call(this, cell, parentElement);
        const { column, row } = cell;
        // The header value is the CSV header, or the column id without one
        const headerValue = column.header?.value;
        content.getMainElement().setAttribute('aria-label', getCellEditorLabel(
            column.id,
            headerValue && headerValue !== column.id ? headerValue : void 0,
            row.index === void 0 ? void 0 : row.index + 1
        ));
        return content;
    };
    render.labelsEditor = true;
    rendererPrototype.render = render;
}
