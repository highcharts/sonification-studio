/*
    Additions to Grid Pro for the data grid (Grid.vue). Import this module
    before creating the grid.
*/

import * as GridPro from '@highcharts/grid-pro/grid-pro';
import type { CellRendererOptions } from '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/CellRenderer';
import type { NumberInputRendererOptions } from '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/Renderers/NumberInputRenderer';
import type { TableBodySection } from '@highcharts/grid-pro/es-modules/Grid/Core/Table/Table';
import { clearableNumberInputType } from './utils/gridData';

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

// Does nothing when the renderer is registered already (on a hot reload)
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
