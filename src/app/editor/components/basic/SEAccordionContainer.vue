<!--
    A container for SEAccordionItems, handles some additional keyboard navigation.
-->
<template>
    <div
        ref="container"
        class="se-accordion-container"
        @keydown.up="onmove(-1, $event)"
        @keydown.down="onmove(1, $event)"
        @keydown.home="onmovehome"
        @keydown.end="onmoveend"
    >
        <slot />
    </div>
</template>

<script lang="ts">
export default {
    methods: {
        getAccordionItemFromKeydownEvent(e: KeyboardEvent): HTMLElement|null {
            const btn = e.target as HTMLElement;
            if (!btn) {
                throw 'SEAccordionContainer: No target for keyboard event.';
            }

            const grandparent = btn.parentNode?.parentNode as HTMLElement;
            if (grandparent.classList.contains('se-accordion-item')) {
                return grandparent;
            }

            return null;
        },

        focusAccordionItem(item: HTMLElement) {
            const btn = item.querySelector('button');
            if (btn && btn.focus) {
                btn.focus();
            }
        },

        onmove(direction: number, e: KeyboardEvent) {
            const selected = this.getAccordionItemFromKeydownEvent(e);
            if (!selected) {
                return;
            }

            const sibling = selected[direction > 0 ? 'nextSibling' : 'previousSibling'];
            if (sibling) {
                this.focusAccordionItem(sibling as HTMLElement);
                e.preventDefault();
            }
        },

        onmovehome(e: KeyboardEvent) {
            const items = (this.$refs.container as HTMLElement).querySelectorAll('se-accordion-item');
            if (items.length) {
                this.focusAccordionItem(items[0] as HTMLElement);
                e.preventDefault();
            }
        },

        onmoveend(e: KeyboardEvent) {
            const items = (this.$refs.container as HTMLElement).querySelectorAll('se-accordion-item');
            if (items.length) {
                this.focusAccordionItem(items[items.length - 1] as HTMLElement);
                e.preventDefault();
            }
        }
    }
};
</script>

<style lang="less" scoped>
</style>
