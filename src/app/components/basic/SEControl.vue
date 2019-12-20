<!--
    A reusable control with a label and a helptext.
    The input control is placed within the default slot.

    Props:
        - label: String - The label text to show.
        - controlId: String - Id of the input control.
        - [helptext]: String - Show help icon with text popup.
        - [horizontal]: Boolean - Show label to the right of control, rather than above.
-->
<template>
    <div
        class="se-control"
        :class="{ horizontal: horizontal }"
    >
        <div class="se-control-label-container">
            <label
                :for="controlId"
                class="se-control-label"
            >
                {{ label }}
            </label>
            <button
                v-if="helptext"
                class="helpicon"
            >
                ?
            </button>
        </div>
        <div class="se-control-content">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        label: { type: String, required: true },
        controlId: { type: String, required: true },
        helptext: { type: String, default: '' },
        horizontal: { type: Boolean, default: false }
    }
};
</script>

<style lang="less" scoped>
    @import "../../colors";

    .se-control {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        &.horizontal {
            flex-direction: row-reverse;
            justify-content: flex-end;
            .se-control-label {
                margin-left: 10px;
            }
        }
    }

    .se-control-content {
        flex: 1;
    }

    .se-control-label {
        margin: 3px;
    }

    .helpicon {
        display: none;
    }

</style>
