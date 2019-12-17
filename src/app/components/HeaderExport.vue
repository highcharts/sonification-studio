<template>
    <div
        role="group"
        aria-label="Export project"
        class="export-container"
    >
        <SEButton
            dark
            @click="$emit('save')"
        >
            Save
        </SEButton>
        <SEButton
            dark
            @click="$emit('publish')"
        >
            Publish
        </SEButton>
    </div>
</template>

<script lang="ts">
import SEButton from './SEButton.vue';

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
}
</style>
