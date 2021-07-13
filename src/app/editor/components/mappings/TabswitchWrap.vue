<template>
    <SEControl
        helptext="Select between global settings that apply to the whole chart, and data series settings that apply to a single data series - such as a single line in a line chart."
        :helpfor="name"
        helptext-below
        horizontal-reverse
    >
        <slot />
    </SEControl>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';

export default {
    components: {
        SEControl
    },
    props: {
        name: { type: String, required: true }
    }
};
</script>

<style lang="less" scoped>
    .se-control {
        margin-bottom: 25px;
        grid-template-columns: auto 1fr auto;
    }
</style>
