import { describe, expect, test } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import HeaderTab from '../../../src/app/editor/components/HeaderTab.vue';

describe('HeaderTab.vue', () => {
    test('Should contain button element', () => {
        const h = shallowMount(HeaderTab, {
            props: { controls: 'abc' }
        });
        expect(h.html()).toContain('button');
    });
});
