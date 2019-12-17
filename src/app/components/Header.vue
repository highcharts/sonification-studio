<template>
    <header>
        <HeaderNav class="section-nav" />
        <HeaderExport class="section-export" />
    </header>
</template>

<script lang="ts">
import HeaderNav from './HeaderNav.vue';
import HeaderExport from './HeaderExport.vue';

export default {
    components: {
        HeaderNav,
        HeaderExport
    }
};
</script>

<style lang="less" scoped>
header {
    width: 100%;
    background-color: white;
    display: flex;
}
.section-nav {
    flex: 3;
}
.section-export {
    flex: 2;
}
</style>
