<!--
    A reusable file upload button.
    Emits @load event with file contents when a file has been loaded.

    Props:
        - [dark]: Boolean - Alternate styling for a dark button.
        - [wide]: Boolean - Alternate styling for a wider button.
-->
<template>
    <div class="se-file-upload-container">
        <SEButton
            :class="{ dark: dark, wide: wide }"
            @click="triggerDialog"
        >
            <slot />
        </SEButton>
        <input
            ref="fileInput"
            aria-hidden="true"
            tabindex="-1"
            type="file"
            :accept="fileTypes"
            @change="emitLoadEventWithFileContents"
        >
    </div>
</template>

<script lang="ts">
import SEButton from './SEButton.vue';

export default {
    components: {
        SEButton
    },
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

    input {
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        height: 1px;
        overflow: hidden;
        white-space: nowrap;
        opacity: 0.00001;
        z-index: -1;
    }

    input::-moz-focus-inner {
        border: 0;
    }

    .se-button {
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        margin-top: 4px;
        margin-bottom: 6px;
        border-radius: 0;
    }

    .se-file-upload-container {
        box-sizing: border-box;
    }
</style>
