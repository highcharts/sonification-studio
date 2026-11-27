// Set the focus outline color here:
const outlineColor = '#eb4034';
// ---------------------------------

export function removeFocusOutlineUnlessKeypress(): void {
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);

    document.addEventListener('mousedown', () => {
        styleElement.textContent = ':focus{outline:0}';
    });

    document.addEventListener('keydown', e => {
        if (['Enter', ' ', 'Tab'].includes(e.key)) {
            styleElement.textContent = `:focus{outline: solid 3px ${outlineColor};}`;
        }
    });
}
