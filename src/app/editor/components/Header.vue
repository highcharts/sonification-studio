<template>
    <header>
        <div class="topRow">
            <HeaderNav class="section-nav" />
            <HeaderImport class="section-import" />
            <HeaderExport class="section-export" />
        </div>
    </header>
</template>

<script lang="ts">
import HeaderNav from './HeaderNav.vue';
import HeaderImport from './HeaderImport.vue';
import HeaderExport from './HeaderExport.vue';

export default {
    components: {
        HeaderNav,
        HeaderImport,
        HeaderExport
    }
};
</script>

<style lang="less" scoped>
    header {
        display: flex;
    }
    .topRow {
        width: 100%;
        display: flex;
    }
</style>
