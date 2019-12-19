<template>
    <div class="se-toggle-container">
        <button
            v-for="btn in options"
            :key="btn.name"
            role="tab"
            :class="{ selected: selectedButton === btn.name }"
            :aria-selected="selectedButton === btn.name"
            :aria-controls="btn.controls"
            @click="onclick(btn)"
        >
            {{ btn.name }}
        </button>
    </div>
</template>

<script lang="ts">
export interface SEToggleButtonDefinition {
    name: string;
    controls: string;
    selected?: boolean;
}

export default {
    props: {
        options: { type: Array, required: true }
    },
    data: function () {
        return {
            selectedButton: ''
        };
    },
    created: function (): void {
        const defs = this.options as Array<SEToggleButtonDefinition>;
        const defWithSelection = defs.find(def => def.selected) || defs[0];
        this.selectedButton = defWithSelection.name;
        this.$emit('click', defWithSelection.controls);
    },
    methods: {
        onclick(button: SEToggleButtonDefinition) {
            this.selectedButton = button.name;
            this.$emit('click', button.controls);
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .se-toggle-container {
        display: flex;
        justify-items: stretch;
        width: 100%;
    }

    button {
        margin: 0;
        padding: 4px 20px;
        background-color: @sebutton-bg;
        color: @sebutton-color;
        border: 1px solid @sebutton-color;
        border-radius: 0;
        font: inherit;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        display: block;
        &:hover {
            background-color: @setogglebutton-hover-bg;
            color: @setogglebutton-hover-color;
        }
        &:active {
            background-color: darken(@sebutton-hover-bg, 5%);
            color: darken(@sebutton-hover-color, 5%);
        }
        &.selected {
            background-color: @sebutton-hover-bg;
            color: @sebutton-hover-color;
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
