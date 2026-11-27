import { afterEach, describe, expect, test } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import SEModalInfo from '../../../src/app/editor/components/basic/SEModalInfo.vue';

describe('SEModalInfo.vue', () => {
    let wrapper: VueWrapper;

    const mountDialog = () => {
        wrapper = mount(SEModalInfo, {
            attachTo: document.body,
            props: { dialogTitle: 'Help' },
            slots: { default: '<p>Content</p>' }
        });
        return wrapper;
    };

    afterEach(() => {
        wrapper.unmount();
    });

    // What a browser does on Enter on a button: keydown, then a click
    const pressEnter = (element: Element) => {
        const keydown = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        element.dispatchEvent(keydown);
        if (!keydown.defaultPrevented) {
            (element as HTMLElement).click();
        }
    };

    test('Is a modal dialog, without hiding the rest of the page', () => {
        const sibling = document.createElement('main');
        document.body.appendChild(sibling);
        const dialog = mountDialog().find('[role="dialog"]');

        expect(dialog.attributes('aria-modal')).toBe('true');
        expect(dialog.attributes('aria-label')).toBe('Help');
        expect(sibling.hasAttribute('aria-hidden')).toBe(false);
        sibling.remove();
    });

    test('Closes once on Enter on either close button', () => {
        mountDialog();
        for (const button of wrapper.findAll('button')) {
            const emittedBefore = wrapper.emitted('close')?.length ?? 0;
            pressEnter(button.element);
            expect(wrapper.emitted('close')).toHaveLength(emittedBefore + 1);
        }
    });

    test('Closes on Enter and Space on the dialog itself', async () => {
        const dialog = mountDialog().find('[role="dialog"]');
        await dialog.trigger('keydown', { key: 'Enter' });
        await dialog.trigger('keydown', { key: ' ' });
        expect(wrapper.emitted('close')).toHaveLength(2);
    });
});
