<template>
    <div>
        <SETabSwitch
            arialabel="Audio settings type"
            :options="toggleMappingOptions"
            class="toggleView"
            @click="toggleMappingActivated"
        />
        <div
            :is="activeView"
            :id="activeView"
            class="activeView"
        />
    </div>
</template>

<script lang="ts">
import SETabSwitch from '../basic/SETabSwitch.vue';
import AudioMappingsSeries from './AudioMappingsSeries.vue';
import AudioMappingsGlobal from './AudioMappingsGlobal.vue';

export default {
    components: {
        SETabSwitch,
        AudioMappingsSeries,
        AudioMappingsGlobal
    },
    data() {
        return {
            toggleMappingOptions: [{
                name: 'Global settings',
                controls: 'AudioMappingsGlobal',
                selected: true
            }, {
                name: 'Data series settings',
                controls: 'AudioMappingsSeries'
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
        margin-bottom: 15px;
        margin-top: 3px;
    }
</style>
