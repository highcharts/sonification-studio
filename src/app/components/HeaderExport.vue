<template>
    <div
        role="group"
        aria-label="Save project"
        class="export-container"
    >
        <SEButton
            dark
            @click="$emit('save')"
        >
            Save project
        </SEButton>
    </div>
</template>

<script lang="ts">
import SEButton from './basic/SEButton.vue';

export default {
    components: {
        SEButton
    }
};
</script>

<style lang="less" scoped>
    .export-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .se-button {
        margin-top: 4px;
        margin-bottom: 6px;
    }
</style>
