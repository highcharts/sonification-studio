<template>
    <header>
        <div class="topRow">
            <HeaderNav
                class="section-nav"
                @tab-selected="propagateTabSelected"
            />
            <HeaderExport class="section-export" />
        </div>
        <PlayControls />
    </header>
</template>

<script lang="ts">
import HeaderNav from './HeaderNav.vue';
import HeaderExport from './HeaderExport.vue';
import PlayControls from './PlayControls.vue';

export default {
    components: {
        HeaderNav,
        HeaderExport,
        PlayControls
    },
    methods: {
        propagateTabSelected: function (controlsId: string): void {
            this.$emit('tab-selected', controlsId);
        }
    }
};
</script>

<style lang="less" scoped>
    header {
        display: flex;
        flex-direction: column;
    }
    .topRow {
        width: 100%;
        display: flex;
    }
    .section-nav {
        flex: 3;
    }
    .section-export {
        flex: 2;
    }
</style>
