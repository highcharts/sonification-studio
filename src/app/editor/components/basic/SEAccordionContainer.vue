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
import { defineComponent } from 'vue';

export default defineComponent({
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

            // Element siblings: Vue 3 places empty text nodes (fragment
            // anchors) around slotted and v-for items.
            const sibling = selected[direction > 0 ? 'nextElementSibling' : 'previousElementSibling'];
            if (sibling) {
                this.focusAccordionItem(sibling as HTMLElement);
                e.preventDefault();
            }
        },

        // The accordion items of this container, if the event is on the
        // header of one of them. Otherwise none: Home and End keep their use
        // in the items' content (text boxes, sliders), and a nested
        // container handles its own items.
        getItemsForHeaderKeydown(e: KeyboardEvent): HTMLElement[] {
            const container = this.$refs.container as HTMLElement;
            const selected = this.getAccordionItemFromKeydownEvent(e);
            if (!selected || selected.parentElement !== container) {
                return [];
            }
            return Array.from(container.querySelectorAll<HTMLElement>(':scope > .se-accordion-item'));
        },

        onmovehome(e: KeyboardEvent) {
            const items = this.getItemsForHeaderKeydown(e);
            if (items.length) {
                this.focusAccordionItem(items[0]);
                e.preventDefault();
            }
        },

        onmoveend(e: KeyboardEvent) {
            const items = this.getItemsForHeaderKeydown(e);
            if (items.length) {
                this.focusAccordionItem(items[items.length - 1]);
                e.preventDefault();
            }
        }
    }
});
</script>

<style lang="less" scoped>
</style>
