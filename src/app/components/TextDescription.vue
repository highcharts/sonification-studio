<template>
    <section aria-label="Text description">
        <h2>Text Description</h2>
        <div id="textdesc-controls">
            <SEDropdown
                :options="dropdownList"
                label="Choose column to describe"
            />
            <SEButton
                dark
                wide
            >
                Text Description
            </SEButton>
            <SEButton
                dark
                wide
            >
                Speak
            </SEButton>
        </div>
        <textarea />
    </section>
</template>

<script lang="ts">
import SEButton from './SEButton.vue';
import SEDropdown from './SEDropdown.vue';

export default {
    components: {
        SEButton, SEDropdown
    },
    data: function () {
        return {
            dropdownList: [{
                name: 'Column A',
                value: 1
            }, {
                name: 'Column B',
                value: 2,
                selected: true
            }, {
                name: 'Column C',
                value: 3
            }]
        };
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        background-color: @main-content-bg-color;
        display: flex;
        flex-direction: column;
        padding: 30px;
    }

    h2 {
        font-size: 21px;
        color: @text-description-heading-color;
        margin-bottom: 10px;
        font-weight: normal;
    }

    #textdesc-controls {
        display: flex;
        align-items: center;
        margin: 5px 0;
    }

    .se-dropdown {
        margin-right: 10px;
        width: 160px;
    }

    textarea {
        flex: 1;
        resize: none;
        margin-top: 10px;
        padding: 5px;
        border: 1px solid @text-description-border-color;
        &:focus {
            outline: 2px solid @text-description-focus-color;
        }
        font-size: 14px;
    }
</style>
