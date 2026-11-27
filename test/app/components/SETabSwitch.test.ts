import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import SETabSwitch from '../../../src/app/editor/components/basic/SETabSwitch.vue';

describe('SETabSwitch.vue', () => {
    test('Only the selected tab controls a panel, as only its panel is rendered', async () => {
        const wrapper = mount(SETabSwitch, {
            attachTo: document.body,
            props: {
                arialabel: 'Settings type',
                options: [
                    { name: 'Global settings', controls: 'GlobalPanel', selected: true },
                    { name: 'Data series settings', controls: 'SeriesPanel' }
                ]
            }
        });
        const controls = () => wrapper.findAll('[role="tab"]').map((tab) => tab.attributes('aria-controls'));

        expect(controls()).toEqual(['GlobalPanel', undefined]);
        await wrapper.findAll('[role="tab"]')[1].trigger('click');
        expect(controls()).toEqual([undefined, 'SeriesPanel']);
        expect(wrapper.emitted('click')?.at(-1)).toEqual(['SeriesPanel']);
        wrapper.unmount();
    });
});
