<template>
    <div class="info-container">
        <HomeHeader />
        <HomeMain />
        <div class="spacer" />
        <HomeFooter />
    </div>
</template>

<script lang="ts">
import HomeHeader from './HomeHeader.vue';
import HomeFooter from './HomeFooter.vue';
import HomeMain from './HomeMain.vue';

export default {
    components: {
        HomeHeader, HomeFooter, HomeMain
    }
};
</script>

<style lang="less" scoped>
    .info-container {
        min-width: 320px;
        font-family: 'Roboto', sans-serif;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        background-color: #fff;
    }

    .spacer {
        flex: 1;
    }
</style>
