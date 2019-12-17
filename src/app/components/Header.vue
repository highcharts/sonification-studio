<template>
    <header>
        <HeaderNav class="navbar" />
    </header>
</template>

<script lang="ts">
import HeaderNav from './HeaderNav.vue';

export default {
    components: {
        HeaderNav
    }
};
</script>

<style lang="less" scoped>
header {
    width: 100%;
    background-color: white;
}
.navbar {
    width: 50%;
}
</style>
