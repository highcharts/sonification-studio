import { shallowMount } from '@vue/test-utils';
import HeaderNav from '../../../src/app/components/HeaderNav.vue';

describe('HeaderNav.vue', () => {
    test('Should contain nav element', () => {
        const h = shallowMount(HeaderNav);
        expect(h.html()).toContain('nav');
    });
});
