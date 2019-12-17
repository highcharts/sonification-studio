import { shallowMount } from '@vue/test-utils';
import HeaderTab from '../../../src/app/components/HeaderTab.vue';

describe('HeaderTab.vue', () => {
    test('Should contain button element', () => {
        const h = shallowMount(HeaderTab, {
            propsData: { controls: 'abc' }
        });
        expect(h.html()).toContain('button');
    });
});
