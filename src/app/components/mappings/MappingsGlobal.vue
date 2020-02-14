<template>
    <div>
        <h2>Mappings: Global</h2>
        <div class="controls-container">
            <SEControl
                control-id="global-speed"
                label="Speed"
                helptext="Set the speed of the sonification"
            >
                <SESlider
                    id="global-speed"
                    v-model.number="volume"
                />
            </SEControl>
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';

export default {
    components: {
        SEControl,
        SESlider
    },
    computed: {
        volume: {
            get() { return (this as any).$store.state.sonifyParametersStore.speed; },
            set(speed) { return this.$store.commit('sonifyParametersStore/setSpeed', speed); }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../../sidebar";

    h2 {
        margin: 20px 5px;
    }
</style>
