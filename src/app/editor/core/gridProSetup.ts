/*
    Additions to Grid Pro for the data grid (Grid.vue). Import this module
    before creating the grid.
*/

import * as GridPro from '@highcharts/grid-pro/grid-pro';
import type { CellRendererOptions } from '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/CellRenderer';
import type { NumberInputRendererOptions } from '@highcharts/grid-pro/es-modules/Grid/Pro/CellRendering/Renderers/NumberInputRenderer';
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
