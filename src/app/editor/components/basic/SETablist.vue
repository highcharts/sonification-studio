<!--
    A reusable tablist, not containing tabs, but wraps around the tabs, dealing with keyboard nav and ARIA for the list
    itself.

    Allows for using different tab styles for the tabs themselves while abstracting away the keyboard nav.
-->
<template>
    <div
        ref="tablist"
        role="tablist"
        class="se-tablist"
        @keydown.left="onmove(-1, $event)"
        @keydown.right="onmove(1, $event)"
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
    mounted() {
        this.resetTabindex();
        const tabs = this.getTabsAsNodeList();
        const selectedIx = this.getSelectedTabIx();
        tabs[selectedIx].setAttribute('tabindex', '0');
    },
    methods: {
        resetTabindex() {
            const tabs = this.getTabsAsNodeList();
            for (let i = 0; i < tabs.length; ++i) {
                tabs[i].setAttribute('tabindex', '-1');
            }
        },

        activate(el: Element) {
            this.resetTabindex();
            el.setAttribute('tabindex', '0');
            if ((el as any).click) {
                (el as HTMLButtonElement).click();
            } else {
                const e = new Event('click');
                el.dispatchEvent(e);
            }
            if ((el as any).focus) {
                (el as any).focus();
            }
        },

        getTabsAsNodeList(): NodeListOf<Element> {
            const parent = this.$refs.tablist as Element;
            const children = parent.querySelectorAll('[role="tab"]');
            return children;
        },

        getSelectedTabIx(): number {
            const tabs = this.getTabsAsNodeList();
            for (let i = 0; i < tabs.length; ++i) {
                if (tabs[i].getAttribute('aria-selected') === 'true') {
                    return i;
                }
            }
            return -1;
        },

        onmove(direction: number, e: KeyboardEvent) {
            const children = this.getTabsAsNodeList();
            const selectedIx = this.getSelectedTabIx();
            let newIx = selectedIx + direction;
            if (newIx < 0) {
                newIx = children.length - 1;
            } else if (newIx >= children.length) {
                newIx = 0;
            }
            e.preventDefault();
            this.activate(children[newIx]);
        },

        onmovehome(e: KeyboardEvent) {
            const parent = this.$refs.tablist as Element;
            const child = parent.querySelector('[role="tab"]');
            if (child) {
                e.preventDefault();
                this.activate(child);
            }
        },

        onmoveend(e: KeyboardEvent) {
            const children = this.getTabsAsNodeList();
            e.preventDefault();
            this.activate(children[children.length - 1]);
        }
    }
};
</script>

<style lang="less" scoped>
    .se-tablist {
        z-index: 98; /* Avoid most focus outline clipping, but don't go above popups */
    }
</style>
