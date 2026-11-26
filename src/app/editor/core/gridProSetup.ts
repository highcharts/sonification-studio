/*
    Changes to Grid Pro for the data grid (Grid.vue), the app's only grid.
    Import this module before creating the grid.
*/

import * as GridPro from '@highcharts/grid-pro/grid-pro';

// Number cells are edited in Grid Pro's number input, which gives a cleared
// cell the value 0 (+''). This one leaves it empty, as the store and the
// chart have it. (Grid Pro's text input cannot clear a number cell: it gives
// it null, and the cell then keeps its old value.)
const { numberInput: NumberInputRenderer } = GridPro.CellRendererRegistry.types;

class ClearableNumberInputRenderer extends NumberInputRenderer {
    override render(cell: GridPro.TableCell, parentElement?: HTMLElement) {
        const content = super.render(cell, parentElement);
        Object.defineProperty(content, 'value', {
            get: () => content.rawValue === '' ? '' : Number(content.rawValue)
        });
        return content;
    }
}

GridPro.CellRendererRegistry.types.numberInput = ClearableNumberInputRenderer;
