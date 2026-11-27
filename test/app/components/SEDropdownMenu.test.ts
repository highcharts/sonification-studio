import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import SEDropdownMenu, { type SEDropdownMenuOption } from '../../../src/app/editor/components/basic/SEDropdownMenu.vue';

// jsdom doesn't activate buttons from the keyboard, so do what a browser
// does: Enter clicks a focused native button after keydown, Space after
// keyup, unless a keydown listener prevented the default action.
function pressKey(el: HTMLElement, key: 'Enter' | ' ') {
    const keydown = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    el.dispatchEvent(keydown);
    if (key === 'Enter' && !keydown.defaultPrevented) {
        el.click();
    }
    el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
    if (key === ' ' && !keydown.defaultPrevented) {
        el.click();
    }
}

describe('SEDropdownMenu.vue', () => {
    let wrapper: VueWrapper;
    const onclick = vi.fn();
    const options: SEDropdownMenuOption[] = [{
        label: 'CSV Data',
        icon: '',
        type: 'button',
        onclick
    }];

    const menuButton = () => wrapper.find<HTMLButtonElement>('button.se-button');
    const menuItem = () => wrapper.findAll<HTMLButtonElement>('.se-dropdownmenu-popup button')
        .find(b => b.text() === 'CSV Data');

    beforeEach(async () => {
        wrapper = mount(SEDropdownMenu, {
            props: { buttonText: 'Export', buttonIcon: '', options },
            attachTo: document.body
        });
        await menuButton().trigger('click');
    });

    afterEach(() => {
        wrapper.unmount();
        onclick.mockClear();
        vi.useRealTimers();
    });

    test.each([['Enter', 'Enter'], ['Space', ' ']] as const)(
        'Pressing %s on a menu item runs its action once',
        (_name, key) => {
            const item = menuItem()!.element;
            item.focus();
            pressKey(item, key);
            expect(onclick).toHaveBeenCalledTimes(1);
        }
    );

    test('Escape closes the menu and returns focus to the menu button', async () => {
        vi.useFakeTimers();
        const popup = wrapper.find<HTMLElement>('.se-dropdownmenu-popup');
        expect(popup.isVisible()).toBe(true);

        const item = menuItem()!.element;
        item.focus();
        item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(popup.isVisible()).toBe(false);

        vi.advanceTimersByTime(20);
        expect(document.activeElement).toBe(menuButton().element);
        expect(onclick).not.toHaveBeenCalled();
    });
});
