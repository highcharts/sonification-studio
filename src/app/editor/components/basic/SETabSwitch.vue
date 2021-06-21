<!--
    A reusable tab switch styled as buttons. Provide tabs through options prop.
    Does not perform switching logic, but emits click event with the active
    content ID.

    @todo: Rewrite to handle switching as well.

    Props:
        - options: Array<{ name, controls }> - Tab definitions. options[].controls
            is the ID to the tab content activated by the switch.
        - arialabel: String - Label for the switch.
-->
<template>
    <SETablist
        class="se-tabswitch-container"
        role="tablist"
        :aria-label="arialabel"
    >
        <button
            v-for="btn in options"
            :key="btn.name"
            role="tab"
            tabindex="-1"
            :class="{ selected: selectedButton === btn.name }"
            :aria-selected="selectedButton === btn.name ? 'true' : 'false'"
            :aria-controls="btn.controls"
            @click="onclick(btn)"
        >
            {{ btn.name }}
        </button>
    </SETablist>
</template>

<script lang="ts">
import SETablist from './SETablist.vue';

export interface SETabDefinition {
    name: string;
    controls: string;
    selected?: boolean;
}

export default {
    components: {
        SETablist
    },
    props: {
        options: { type: Array, required: true },
        arialabel: { type: String, required: true }
    },
    data() {
        return {
            selectedButton: ''
        };
    },
    created(): void {
        const defs = this.options as Array<SETabDefinition>;
        const defWithSelection = defs.find(def => def.selected) || defs[0];
        this.selectedButton = defWithSelection.name;
        this.$emit('click', defWithSelection.controls);
    },
    methods: {
        onclick(button: SETabDefinition) {
            this.selectedButton = button.name;
            this.$emit('click', button.controls);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .se-tabswitch-container {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    button {
        margin: 0;
        padding: 4px 25px;
        background-color: @setabswitch-bg;
        color: @setabswitch-color;
        border: 1px solid @setabswitch-color;
        border-radius: 0;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: bold;
        cursor: pointer;
        display: block;
        &:hover {
            background-color: @setabswitch-hover-bg;
            color: @setabswitch-hover-color;
        }
        &:active {
            background-color: darken(@setabswitch-hover-bg, 5%);
            color: darken(@setabswitch-hover-color, 5%);
        }
        &.selected {
            background-color: @setabswitch-selected-bg;
            color: @setabswitch-selected-color;
        }
        &:first-child {
            border-radius: 5px 0 0 5px;
        }
        &:last-child {
            border-radius: 0 5px 5px 0;
        }
    }

    button::-moz-focus-inner {
        border: 0;
    }
</style>
