import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import HeaderNav from '../../../src/app/components/HeaderNav.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('HeaderNav.vue', () => {
    let store: any;

    beforeEach(() => {
        store = new Vuex.Store({
            state: {}
        });
    });

    test('Should contain nav element', () => {
        const h = shallowMount(HeaderNav, { store, localVue });
        expect(h.html()).toContain('nav');
    });
});
