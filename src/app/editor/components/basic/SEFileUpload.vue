<!--
    A hidden file upload dialog.
    Emits @load event with file contents when a file has been loaded.

    Props:
        - [fileTypes]: String with accepted file types
-->
<template>
    <input
        ref="fileInput"
        class="se-file-upload-dialog"
        aria-hidden="true"
        tabindex="-1"
        type="file"
        :accept="fileTypes"
        @change="emitLoadEventWithFileContents"
    >
</template>

<script lang="ts">
export default {
    props: {
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

        triggerDialog() {
            const fileInput: any = this.$refs.fileInput;
            if (fileInput) {
                fileInput.click();
            }
        }
    }
};
</script>

<style lang="less" scoped>
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
</style>
