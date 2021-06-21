<!--
    A reusable file upload button.
    Emits @load event with file contents when a file has been loaded.

    Props:
        - [dark]: Boolean - Alternate styling for a dark button.
        - [wide]: Boolean - Alternate styling for a wider button.
-->
<template>
    <label
        tabindex="0"
        :class="{ dark: dark, wide: wide }"
        @keydown.enter="triggerDialog"
        @keydown.space="triggerDialog"
    >
        <slot />
        <input
            ref="fileInput"
            type="file"
            tabindex="-1"
            :accept="fileTypes"
            @change="emitLoadEventWithFileContents"
        >
    </label>
</template>

<script lang="ts">
export default {
    props: {
        dark: { type: Boolean, default: false },
        wide: { type: Boolean, default: false },
        fileTypes: { type: String, default: '.txt,.csv' }
    },
    methods: {
        emitLoadEventWithFileContents(e: any) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = ev => this.$emit('load', ev?.target?.result);
            reader.readAsText(file);

            const fileInput: any = this.$refs.fileInput;
            if (fileInput) {
                fileInput.value = '';
            }
        },

        triggerDialog(e: Event) {
            const fileInput: any = this.$refs.fileInput;
            if (fileInput) {
                fileInput.click();
                e.preventDefault();
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    /* Styling similar to SEButton */

    input {
        position: absolute;
        top: 0;
        left: 0;
        height: 1px;
        width: 1px;
        overflow: hidden;
        white-space: nowrap;
        opacity: 0;
        z-index: -1;
    }

    label {
        margin: 5px;
        box-sizing: border-box;
        padding: 6px 15px;
        background-color: @sebutton-bg;
        color: @sebutton-color;
        border: 1px solid @sebutton-color;
        border-radius: 14px;
        font: inherit;
        font-size: 0.875rem;
        font-weight: bold;
        cursor: pointer;
        display: block;
        position: relative;
        &:hover {
            background-color: @sebutton-hover-bg;
            color: @sebutton-hover-color;
        }
        &:active {
            background-color: darken(@sebutton-hover-bg, 5%);
            color: darken(@sebutton-hover-color, 5%);
        }
    }

    .dark {
        background-color: @sebutton-dark-bg;
        color: @sebutton-dark-color;
        border: 1px solid @sebutton-dark-bg;
        &:hover {
            background-color: @sebutton-dark-hover-bg;
            color: @sebutton-dark-hover-color;
            border-color: @sebutton-dark-hover-color;
        }
        &:active {
            background-color: darken(@sebutton-dark-hover-bg, 3%);
            color: darken(@sebutton-dark-hover-color, 3%);
        }
    }

    .wide {
        padding: 6px 30px;
    }

    input::-moz-focus-inner {
        border: 0;
    }
</style>
