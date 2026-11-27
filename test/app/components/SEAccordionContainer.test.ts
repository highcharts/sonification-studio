import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, Fragment, h } from 'vue';
import SEAccordionContainer from '../../../src/app/editor/components/basic/SEAccordionContainer.vue';
import SEAccordionItem from '../../../src/app/editor/components/basic/SEAccordionItem.vue';

const item = (heading: string, content?: () => ReturnType<typeof h>[]) =>
    h(SEAccordionItem, { key: heading, heading, controls: heading + '-content', selected: !!content },
        content ? { default: content } : undefined);

// Three items in a fragment, as v-for renders them. The first holds a text
// box, the second a nested accordion.
const Accordion = defineComponent({
    render: () => h(SEAccordionContainer, null, {
        default: () => [h(Fragment, null, [
            item('First', () => [h('input', { type: 'text', 'aria-label': 'Text box' })]),
            item('Second', () => [h(SEAccordionContainer, null, {
                default: () => [item('Nested 1'), item('Nested 2'), item('Nested 3')]
            })]),
            item('Third')
        ])]
    })
});

describe('SEAccordionContainer.vue', () => {
    let wrapper: VueWrapper;

    const header = (heading: string) => {
        const button = wrapper.findAll('button').find(b => b.text() === heading);
        if (!button) {
            throw new Error('No header ' + heading);
        }
        return button.element;
    };

    // Press a key on an element with focus, returning the event
    const press = (element: HTMLElement, key: string): KeyboardEvent => {
        element.focus();
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event;
    };

    beforeEach(() => {
        wrapper = mount(Accordion, { attachTo: document.body });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('Arrow keys move focus to the previous and next header', () => {
        expect(press(header('First'), 'ArrowDown').defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(header('Second'));
        press(header('Third'), 'ArrowUp');
        expect(document.activeElement).toBe(header('Second'));
    });

    test('Home and End move focus to the first and last header', () => {
        expect(press(header('Second'), 'Home').defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(header('First'));
        expect(press(header('Second'), 'End').defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(header('Third'));
    });

    test('A nested accordion moves within its own headers', () => {
        press(header('Nested 2'), 'End');
        expect(document.activeElement).toBe(header('Nested 3'));
        press(header('Nested 2'), 'Home');
        expect(document.activeElement).toBe(header('Nested 1'));
    });

    test('Home and End in an item\'s content keep their own use', () => {
        const textBox = wrapper.find('input').element;
        for (const key of ['Home', 'End']) {
            expect(press(textBox, key).defaultPrevented).toBe(false);
            expect(document.activeElement).toBe(textBox);
        }
    });
});
