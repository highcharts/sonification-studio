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
        tabindex="0"
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
    methods: {
        activate(el: Element) {
            if ((el as any).click) {
                (el as HTMLButtonElement).click();
            } else {
                const e = new Event('click');
                el.dispatchEvent(e);
            }
        },
        getSelectedTabFromNodeList(nodeList: NodeListOf<Element>): number {
            for (let i = 0; i < nodeList.length; ++i) {
                if (nodeList[i].getAttribute('aria-selected') === 'true') {
                    return i;
                }
            }
            return -1;
        },
        onmove(direction: number, e: KeyboardEvent) {
            const parent = this.$refs.tablist as Element;
            const children = parent.querySelectorAll('[role="tab"]');
            if (children && children.length) {
                const selectedIx = this.getSelectedTabFromNodeList(children);
                let newIx = selectedIx + direction;
                if (newIx < 0) {
                    newIx = children.length - 1;
                } else if (newIx >= children.length) {
                    newIx = 0;
                }
                e.preventDefault();
                this.activate(children[newIx]);
            }
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
            const parent = this.$refs.tablist as Element;
            const children = parent.querySelectorAll('[role="tab"]');
            if (children) {
                e.preventDefault();
                this.activate(children[children.length - 1]);
            }
        }
    }
};
</script>

<style lang="less" scoped>
    .se-tablist {
        z-index: 98; /* Avoid most focus outline clipping, but don't go above popups */
    }
</style>
