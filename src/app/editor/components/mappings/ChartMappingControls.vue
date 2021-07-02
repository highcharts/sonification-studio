<template>
    <div>
        <TabswitchWrap name="Chart settings type">
            <SETabSwitch
                arialabel="Chart settings type"
                :options="toggleMappingOptions"
                class="toggleView"
                @click="toggleMappingActivated"
            />
        </TabswitchWrap>
        <div
            :is="activeView"
            :id="activeView"
            class="activeView"
        />
    </div>
</template>

<script lang="ts">
import SETabSwitch from '../basic/SETabSwitch.vue';
import TabswitchWrap from './TabswitchWrap.vue';
import ChartMappingsSeries from './ChartMappingsSeries.vue';
import ChartMappingsGlobal from './ChartMappingsGlobal.vue';

export default {
    components: {
        SETabSwitch,
        TabswitchWrap,
        ChartMappingsSeries,
        ChartMappingsGlobal
    },
    data() {
        return {
            toggleMappingOptions: [{
                name: 'Global settings',
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
    .activeView {
        width: 100%;
    }

    .toggleView {
        width: 100%;
        margin: 2px 5px 3px 0;
    }
</style>
