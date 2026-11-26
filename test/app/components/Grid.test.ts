import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, type Pinia } from 'pinia';
import Grid from '../../../src/app/editor/components/Grid.vue';
import { useDataStore } from '../../../src/app/editor/store/modules/data';

describe('Grid.vue', () => {
    let pinia: Pinia;
    let wrapper: VueWrapper | undefined;

    beforeEach(() => {
        pinia = createPinia();
        // jsdom has no ResizeObserver, which Grid Pro needs
        vi.stubGlobal('ResizeObserver', class {
            observe() {}
            unobserve() {}
            disconnect() {}
        });
        // Without a Grid Key, Grid Pro warns
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = void 0;
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    // Mount the grid and render it, as it is when the Data tab is first
    // shown (which jsdom's lack of layout does not tell), then wait until
    // it has rendered
    async function mountGrid() {
        wrapper = mount(Grid, { attachTo: document.body, global: { plugins: [pinia] } });
        const vm = wrapper.vm as unknown as { renderGrid(): void; gridRendered: Promise<void> };
        vm.renderGrid();
        await vm.gridRendered;
        await flushPromises();
        return wrapper;
    }

    // The workaround for Grid Pro 3.2 setting aria-rowcount without the
    // header rows when it renders (gridProSetup.ts)
    test('Counts the header rows in aria-rowcount from the first render', async () => {
        // A CSV header row and 8 rows: the grid shows the column ids and the
        // CSV headers as header rows
        useDataStore(pinia).setTableRowData([
            { A: 'Index', B: 'Value' },
            ...[10, 30, 20, 40, 15, 35, 25, 5].map((value, i) => ({ A: '' + i, B: '' + value }))
        ]);

        const table = (await mountGrid()).find('table');

        expect(table.attributes('aria-rowcount')).toBe('10');
        // The body rows rendered come after the 2 header rows
        const rows = table.findAll('tbody tr');
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
            expect(Number(row.attributes('aria-rowindex')))
                .toBe(Number(row.attributes('data-row-index')) + 3);
        }
    });
});
