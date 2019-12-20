<!--
    A reusable control with a label and a helptext.
    The input control is placed within the default slot.

    Props:
        - label: String - The label text to show.
        - labelId: String - Id to place on the label.
        - [helptext]: String - Show help icon with text popup.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
-->
<template>
    <div
        class="se-control"
        :class="{ horizontal: horizontal }"
    >
        <div class="se-control-label">
            <p :id="labelId">
                {{ label }}
            </p>
            <p>?</p>
        </div>
        <slot />
    </div>
</template>

<script lang="ts">
export default {
    props: {
        label: { type: String, required: true },
        labelId: { type: String, required: true },
        helptext: { type: String, default: '' },
        horizontal: { type: Boolean, default: false }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

</style>
