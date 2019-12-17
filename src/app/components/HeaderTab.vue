<template>
    <button
        role="tab"
        :class="{ selected: selected }"
        :aria-selected="selected"
        :aria-controls="controls"
        @click="$emit('click')"
    >
        <slot />
    </button>
</template>

<script lang="ts">
export default {
    props: {
        selected: { type: Boolean, default: false },
        controls: { type: String, required: true }
    }
};
</script>

<style lang="less" scoped>
@import "../colors";

button {
    background-color: @header-tab-btn-bg;
	color: @header-tab-btn-color;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
    text-decoration: underline;
    height: 100%;
    width: 100%;
    margin: 1px;
    display: block;
}

.selected {
    background-color: @header-tab-btn-selected-bg;
    color: @header-tab-btn-selected-color;
    text-decoration: none;
}
</style>
