/*
 * Utility functions for dealing with keyboard events and shortcuts.
 */

export enum Keys {
    Esc = 'Escape',
    Enter = 'Enter',
    Tab = 'Tab',
    Space = ' ',
    Divide = 'Divide',
    Forwardslash = '/',
    Backspace = 'Backspace',
    Delete = 'Delete',
    Up = 'ArrowUp',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
    Right = 'ArrowRight',
    PgUp = 'PageUp',
    PgDown = 'PageDown',
    Home = 'Home',
    End = 'End',
    Insert = 'Insert',
    Pause = 'Pause',
    Play = 'Play',
    Comma = ',',
    Period = '.',
    A = 0, B, C, D, E, F, G, H, I, J, K, L, M,
    N, O, P, Q, R, S, T, U, V, W, X, Y, Z
}

export enum Modifiers {
    None = 0,
    Alt = 1,
    Shift = 2,
    Ctrl = 4,
    Meta = 8
}

/**
 * Returns true if the designated modifiers are pressed.
 * @param mod Modifiers to be pressed - multiple can be added together to designate multiple modifiers pressed.
 * @param event The keyboard event.
 */
export function modifiersPressed(mod: number, event: KeyboardEvent): boolean {
    return !(mod & Modifiers.Alt) === !event.altKey &&
        !(mod & Modifiers.Shift) === !event.shiftKey &&
        !(mod & Modifiers.Ctrl) === !event.ctrlKey &&
        !(mod & Modifiers.Meta) === !event.metaKey;
}

/**
 * Returns true if a key and modifier combo is pressed, by passing in the keyboard event.
 * @param key The key from the keys definition to check.
 * @param mod Modifiers pressed - can be added together to designate multiple modifiers
 * @param event The keyboard event
 */
export function keyPressed(key: Keys, mod: number, event: KeyboardEvent): boolean {
    if (!modifiersPressed(mod, event)) {
        return false;
    }
    const keyString = typeof key !== 'string' ? Keys[key] : key;
    return event.key?.toLowerCase() === keyString.toLowerCase();
}
