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
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        fileTypes: { type: String, default: '.txt,.csv' }
    },
    // load: the file contents (string)
    emits: ['load'],
    methods: {
        emitLoadEventWithFileContents(e: Event) {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();

            reader.onload = ev => this.$emit('load', ev?.target?.result);
            reader.readAsText(file);

            const fileInput = this.$refs.fileInput as HTMLInputElement | undefined;
            if (fileInput) {
                fileInput.value = '';
            }
        },

        triggerDialog() {
            const fileInput = this.$refs.fileInput as HTMLInputElement | undefined;
            if (fileInput) {
                fileInput.click();
            }
        }
    }
});
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
