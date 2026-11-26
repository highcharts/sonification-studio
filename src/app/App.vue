<template>
    <div class="app-container">
        <router-view />
        <div id="routeAnnouncer" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="less" scoped>
    .app-container {
        width: 100%;
        height: 100%;
    }
</style>