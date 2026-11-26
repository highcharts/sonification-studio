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
        <SEFileUpload
            ref="dialog"
            :file-types="fileTypes"
            @load="(e) => $emit('load', e)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SEButton from './SEButton.vue';
import SEFileUpload from './SEFileUpload.vue';

export default defineComponent({
    components: {
        SEButton, SEFileUpload
    },
    props: {
        dark: { type: Boolean, default: false },
        wide: { type: Boolean, default: false },
        fileTypes: { type: String, default: '.txt,.csv' }
    },
    // load: the file contents (string)
    emits: ['load'],
    methods: {
        triggerDialog() {
            (this.$refs.dialog as InstanceType<typeof SEFileUpload>).triggerDialog();
        }
    }
});
</script>

<style lang="less" scoped>
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
