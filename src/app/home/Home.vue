<template>
    <div class="info-container">
        <HomeHeader />
        <main>
            <div>Main content</div>
            <router-link to="/app">
                Go to app
            </router-link>
        </main>
        <div class="spacer" />
        <HomeFooter />
    </div>
</template>

<script lang="ts">
import HomeHeader from './HomeHeader.vue';
import HomeFooter from './HomeFooter.vue';

export default {
    components: {
        HomeHeader, HomeFooter
    }
};
</script>

<style lang="less" scoped>
    .info-container {
        min-width: 320px;
        font-family: "roboto",'Open Sans','Helvetica Neue',Arial,Helvetica,sans-serif;
        display: flex;
        flex-direction: column;
        min-height: 100%;
    }

    .spacer {
        flex: 1;
    }
</style>
