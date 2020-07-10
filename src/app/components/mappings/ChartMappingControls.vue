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
import ChartMappingsSeries from './ChartMappingsSeries.vue';
import ChartMappingsGlobal from './ChartMappingsGlobal.vue';

export default {
    components: {
        SETabSwitch,
        ChartMappingsSeries,
        ChartMappingsGlobal
    },
    data() {
        return {
            toggleMappingOptions: [{
                name: 'Chart settings',
                controls: 'ChartMappingsGlobal',
                selected: true
            }, {
                name: 'Data series settings',
                controls: 'ChartMappingsSeries'
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
