<template>
    <section aria-label="Audio mapping controls">
        <p>Global Settings / Column Settings</p>
        <h2>Mappings: Column B</h2>
        <div>
            <div>
                <h3>Sound scales</h3>
                <div>Content to hide</div>
            </div>
            <div>
                <h3>Pitch</h3>
                <div>Content to hide</div>
            </div>
            <div>
                <h3>Pan (left to right)</h3>
                <div>Content to hide</div>
            </div>
            <div>
                <h3>Volume</h3>
                <div>Content to hide</div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
export default {
    components: {
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        background-color: @main-content-bg-color;
        padding: 10px;
        display: flex;
        flex-direction: column;
    }
</style>
