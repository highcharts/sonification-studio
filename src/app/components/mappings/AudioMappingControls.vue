<template>
    <section aria-label="Audio mapping controls">
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
import AudioMappingsColumn from './AudioMappingsColumn.vue';
import AudioMappingsGlobal from './AudioMappingsGlobal.vue';

export default {
    components: {
        SETabSwitch,
        AudioMappingsColumn,
        AudioMappingsGlobal
    },
    data: function () {
        return {
            toggleMappingOptions: [{
                name: 'Global settings',
                controls: 'AudioMappingsGlobal',
                selected: true
            }, {
                name: 'Column settings',
                controls: 'AudioMappingsColumn'
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
