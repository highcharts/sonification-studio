<template>
    <div
        class="data-container"
        :aria-labelledby="uuid"
    >
        <h2
            :id="uuid"
            class="sr-only"
        >
            Data input
        </h2>
        <div class="grid-toolbar">
            <div>
                <SEControl
                    v-slot="slotProps"
                    class="datasourcepicker"
                    helpfor="Data source"
                    helptext="Select the data source you want to work on."
                    :helptext-below="true"
                    :expand-content="true"
                    :horizontal-reverse="true"
                >
                    <SEDropdown
                        :id="slotProps.controlId"
                        v-model="selectedDataSource"
                        label="Data source"
                        :options="dataSourcesList"
                        @input="onDataSourceChange"
                    />
                    <SEFileUpload
                        ref="uploadDialog"
                        @load="onCSVLoaded"
                    />
                </SEControl>
            </div>
            <SEToolbarMenu
                v-show="!sourceHasCustomUI"
                class="showtoolbar"
                :aria-expanded="showGridTools"
                @click="showGridTools = !showGridTools"
            >
                Show toolbar
            </SEToolbarMenu>
            <span class="placeholder" />
        </div>

        <GridControls
            v-show="!sourceHasCustomUI && showGridTools"
            class="grid-toolbar-container"
            @triggerScrollLastGridRowWithData="onTriggerScrollLastGridRowWithData()"
        />
        <div
            v-show="!sourceHasCustomUI"
            class="data-input-container"
        >
            <h3 class="sr-only">
                Grid
            </h3>
            <Grid ref="grid" />
        </div>

        <DataGSheet
            v-show="selectedDataSource === 'googlesheets'"
            class="data-input-container"
        />
        <DataURLPoll
            v-show="selectedDataSource === 'url'"
            class="data-input-container"
        />
    </div>
</template>

<script lang="ts">
import { getUUID } from '../core/utils/objects';
import Grid from './Grid.vue';
import GridControls from './GridControls.vue';
import DataGSheet from './DataGSheet.vue';
import DataURLPoll from './DataURLpoll.vue';
import SEToolbarMenu from './basic/SEToolbarMenu.vue';
import SEDropdown from './basic/SEDropdown.vue';
import SEControl from './basic/SEControl.vue';
import SEFileUpload from './basic/SEFileUpload.vue';
import { mapState } from 'vuex';

export default {
    components: {
        Grid, GridControls, DataGSheet, DataURLPoll, SEToolbarMenu, SEDropdown, SEControl, SEFileUpload
    },
    data() {
        return {
            csvImportTimer: 0
        };
    },
    computed: {
        uuid: () => getUUID('se-data-input'),
        sourceHasCustomUI() { return this.selectedDataSource === 'url' || this.selectedDataSource === 'googlesheets'; },
        selectedDataSource: {
            get() { return (this as any).$store.state.dataStore.selectedDataSource; },
            set(val) { return this.$store.commit('dataStore/setSelectedDataSource', val); }
        },
        showGridTools: {
            get() { return (this as any).$store.state.viewStore.showGridTools; },
            set(val) { return this.$store.commit('viewStore/setShowGridTools', val); }
        },
        ...mapState('dataStore', ['dataSourcesList'])
    },
    methods: {
        onTriggerScrollLastGridRowWithData() {
            (this.$refs.grid as any).scrollToLastGridRowWithData();
        },
        onCSVDataSource() {
            (this.$refs as any).uploadDialog.triggerDialog();
        },
        onCSVLoaded(fileContents: string) {
            if (fileContents) {
                this.$store.dispatch('dataStore/loadFromCSV', fileContents);
                setTimeout(() => (this as any).$announcer.announce('CSV data loaded into grid.'), 500);
            }
        },
        onDataSourceChange(value: string) {
            if (value === 'csv') {
                // Some dropdowns fire multiple input events, so queue the handler
                clearTimeout(this.csvImportTimer);
                this.csvImportTimer = setTimeout(() => this.onCSVDataSource(), 100);
            }
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

    .data-container {
        display: flex;
        flex-direction: column;
        background-color: @main-content-bg-color;
        padding: 20px;
        padding-top: 15px;
    }

    .data-input-container {
        flex: 1;
    }

    .se-grid-container {
        margin-top: 10px;
    }

    .grid-toolbar {
        display: flex;
        align-items: flex-end;
    }

    .datasourcepicker {
        min-width: 200px;
        margin: 5px 0;
    }

    .showtoolbar {
        margin: 0 10px;
    }

    .placeholder {
        flex: 1;
    }

    .grid-toolbar-container {
        border-top: 1px solid @dark-blue-5;
        padding-top: 10px;
        margin-top: -1px;
    }
</style>
