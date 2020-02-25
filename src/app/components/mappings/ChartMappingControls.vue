<template>
    <section aria-label="Chart settings">
        <SETabSwitch
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
import SETabSwitch from '../basic/SETabSwitch.vue';
import ChartMappingsColumn from './ChartMappingsGlobal.vue';
import ChartMappingsGlobal from './ChartMappingsGlobal.vue';

export default {
    components: {
        SETabSwitch,
        ChartMappingsColumn,
        ChartMappingsGlobal
    },
    data: function () {
        return {
            toggleMappingOptions: [{
                name: 'Global settings',
                controls: 'ChartMappingsGlobal',
                selected: true
            }, {
                name: 'Column settings',
                controls: 'ChartMappingsColumn'
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
    @import "../../colors";

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
