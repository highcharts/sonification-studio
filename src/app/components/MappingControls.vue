<template>
    <section aria-label="Audio mapping controls">
        <SEToggleButton
            :options="toggleMappingOptions"
            class="toggleView"
            @click="toggleMappingActivated"
        />
        <div
            :is="activeView"
            :id="activeView"
            class="activeView"
        />
    </section>
</template>

<script lang="ts">
import SEToggleButton from './SEToggleButton.vue';
import MappingsColumn from './MappingsColumn.vue';
import MappingsGlobal from './MappingsGlobal.vue';

export default {
    components: {
        SEToggleButton,
        MappingsColumn,
        MappingsGlobal
    },
    data: function () {
        return {
            toggleMappingOptions: [{
                name: 'Global settings',
                controls: 'MappingsGlobal'
            }, {
                name: 'Column settings',
                controls: 'MappingsColumn',
                selected: true
            }],
            activeView: ''
        };
    },
    methods: {
        toggleMappingActivated(viewId: string): void {
            this.activeView = viewId;
        }
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

    .activeView {
        width: 100%;
    }

    .toggleView {
        width: 100%;
        margin-bottom: 15px;
    }
</style>
