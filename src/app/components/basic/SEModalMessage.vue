<!--
    A reusable modal message box.
    Use slot for content.
-->
<template>
    <div class="se-modal-message">
        <div
            class="se-modal-message-content"
            role="dialog"
            aria-modal="true"
        >
            <slot />
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "../../colors";

    .se-modal-message {
        position: fixed;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: rgba(255, 255, 255, 0.6);
        top: 0;
        left: 0;
        z-index: 999;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 1;
    }

    .se-modal-message-content {
        max-width: 100%;
        max-height: 100%;
        z-index: 1000;
        background-color: @white;
        padding: 30px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
    }
</style>
