import {
    Keys,
    Modifiers,
    modifiersPressed,
    keyPressed
} from '../../../src/app/editor/core/utils/keyboardUtils';

describe('keyboardUtils.keyPressed', () => {
    test('L key pressed', () => {
        expect(keyPressed(
            Keys.L,
            Modifiers.None,
            { key: 'L' } as KeyboardEvent
        )).toEqual(true);
    });

    test('Lowercase', () => {
        expect(keyPressed(
            Keys.L,
            Modifiers.None,
            { key: 'l' } as KeyboardEvent
        )).toEqual(true);
    });

    test('Modifiers', () => {
        expect(keyPressed(
            Keys.L,
            Modifiers.Shift,
            { key: 'l', shiftKey: true } as KeyboardEvent
        )).toEqual(true);

        expect(keyPressed(
            Keys.Backspace,
            Modifiers.Ctrl + Modifiers.Alt,
            { key: 'Backspace', altKey: true, ctrlKey: true } as KeyboardEvent
        )).toEqual(true);

        expect(keyPressed(
            Keys.Backspace,
            Modifiers.Ctrl + Modifiers.Alt,
            { key: 'Backspace', altKey: true, ctrlKey: true, metaKey: true } as KeyboardEvent
        )).toEqual(false);
    });

    test('Special characters', () => {
        expect(keyPressed(
            Keys.Space,
            Modifiers.None,
            { key: ' ' } as KeyboardEvent
        )).toEqual(true);

        expect(keyPressed(
            Keys.Delete,
            Modifiers.None,
            { key: 'Delete' } as KeyboardEvent
        )).toEqual(true);

        expect(keyPressed(
            Keys.Tab,
            Modifiers.None,
            { key: ' ' } as KeyboardEvent
        )).toEqual(false);
    });
});

describe('keyboardUtils.modifiersPressed', () => {
    test('No modifiers pressed should test true for no modifiers expected', () => {
        expect(modifiersPressed(
            Modifiers.None,
            {} as KeyboardEvent
        )).toEqual(true);
    });

    test('One modifier pressed should test false for no modifiers expected', () => {
        expect(modifiersPressed(
            Modifiers.None,
            { shiftKey: true } as KeyboardEvent
        )).toEqual(false);
    });

    test('No modifiers pressed should test false for one modifier expected', () => {
        expect(modifiersPressed(
            Modifiers.Shift,
            {} as KeyboardEvent
        )).toEqual(false);
    });

    test('Two modifiers pressed should test false for one modifier expected', () => {
        expect(modifiersPressed(
            Modifiers.Shift,
            { shiftKey: true, altKey: true } as KeyboardEvent
        )).toEqual(false);
    });

    test('One modifier pressed should test true for one modifier expected', () => {
        expect(modifiersPressed(
            Modifiers.Shift,
            { shiftKey: true } as KeyboardEvent
        )).toEqual(true);
    });

    test('One modifier pressed should test false for two modifiers expected', () => {
        expect(modifiersPressed(
            Modifiers.Shift + Modifiers.Meta,
            { shiftKey: true } as KeyboardEvent
        )).toEqual(false);
    });

    test('Three modifiers pressed should test false for two modifiers expected', () => {
        expect(modifiersPressed(
            Modifiers.Shift + Modifiers.Meta,
            { shiftKey: true, metaKey: true, altKey: true } as KeyboardEvent
        )).toEqual(false);
    });

    test('Three modifiers pressed should test true for three modifiers expected', () => {
        expect(modifiersPressed(
            Modifiers.Shift + Modifiers.Ctrl + Modifiers.Alt,
            { shiftKey: true, ctrlKey: true, altKey: true } as KeyboardEvent
        )).toEqual(true);
    });

    test('All modifiers pressed', () => {
        expect(modifiersPressed(
            Modifiers.Shift + Modifiers.Ctrl + Modifiers.Alt + Modifiers.Meta,
            { shiftKey: true, ctrlKey: true, altKey: true, metaKey: true } as KeyboardEvent
        )).toEqual(true);
    });
});
