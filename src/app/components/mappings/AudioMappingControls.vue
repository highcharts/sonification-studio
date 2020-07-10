<template>
    <section aria-label="Audio settings">
        <div id="scroll-container">
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
        </div>
    </section>
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
    @import "../../colors";

    section {
        background-color: @main-content-bg-color;
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

    #scroll-container {
        overflow-y: scroll;
        /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
        padding-left: 100px;
        margin-left: -100px;
    }

    .activeView {
        width: 100%;
    }

    .toggleView {
        width: 100%;
        margin-bottom: 15px;
    }
</style>
