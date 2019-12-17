import { shallowMount } from '@vue/test-utils';
import Header from '../../../src/app/components/Header.vue';

describe('Header.vue', () => {
    test('Should contain nav element', () => {
        const h = shallowMount(Header);
        expect(h.html()).toContain('nav');
    });
});
