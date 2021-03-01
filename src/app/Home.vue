<template>
    <div class="info-container">
        <header>
            Header content
        </header>
        <main>
            <div>Main content</div>
            <a
                href="#"
                @click="goToApp"
            >Go to app</a>
        </main>
        <footer>
            Footer content
        </footer>
    </div>
</template>

<script lang="ts">
export default {
    methods: {
        goToApp() {
            console.log('woo');
        }
    }
};
</script>

<style lang="less" scoped>
</style>
