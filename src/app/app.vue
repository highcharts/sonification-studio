<!--
    App component is the root container for the app. It expands to the width and height of
    the element it is placed within. See the "./public" directory for usage.
-->
<template>
    <div class="app-container">
        <Header />
    </div>
</template>

<script lang="ts">
import Header from './components/Header.vue';
import { removeFocusOutlineUnlessKeypress } from './removeFocusOutline';

export default {
    components: {
        Header
    },
    mounted: removeFocusOutlineUnlessKeypress
};
</script>

<style lang="less" scoped>
@import "colors";

.app-container {
    background-color: @app-bg-color;
    padding: 10px;
    height: 100%;
    width: 100%;
    min-width: 600px;
    box-sizing: border-box;
}
</style>
