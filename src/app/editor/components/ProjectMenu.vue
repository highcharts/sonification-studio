<template>
    <div class="project-container">
        <SEDropdownMenu
            button-text="Project"
            :button-icon="menuIcon"
            :options="menuOptions"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SEDropdownMenu, { type SEDropdownMenuOption } from './basic/SEDropdownMenu.vue';
import type { Chart } from 'highcharts';
import Highcharts from '../core/highchartsSetup';
import { downloadProjectFile, restoreFromProjectFile } from '../core/utils/projectFileHandling';
import projectIcon from '../assets/file-export-solid.svg';
import menuIcon from '../assets/bars-solid.svg';

export default defineComponent({
    components: {
        SEDropdownMenu
    },
    data() {
        return {
            menuIcon,
            projectIcon
        };
    },
    computed: {
        menuOptions(): SEDropdownMenuOption[] {
            return [{
                label: 'New Project',
                icon: projectIcon,
                type: 'button',
                onclick: () => this.newProject()
            }, {
                label: 'Open Project',
                icon: projectIcon,
                type: 'fileupload',
                fileTypes: '.hssp',
                onload: (c: string) => this.importProject(c)
            }, {
                label: 'Save Project As',
                icon: projectIcon,
                type: 'button',
                onclick: () => this.dlProject()
            }];
        }
    },
    methods: {
        dlProject() {
            const projectName = this.$chartBridge.getChartTitleForExport();
            downloadProjectFile(projectName, this.$store);
        },
        cleanSlateAndRecreateChart(afterRecreate: () => void) {
            this.$store.commit('seriesParametersStore/clearState');
            // Remove chart from DOM because chart.update does not remove series options
            // - even with one-to-one parameter set.
            this.$store.commit('viewStore/setLoadingChart', true);
            setTimeout(() => {
                this.$store.commit('viewStore/setShowChartComponent', false);
                this.$nextTick(() => {
                    // Add a slight delay before recreating the chart
                    setTimeout(() => {
                        this.$store.commit('viewStore/setShowChartComponent', true);
                        this.$nextTick(() => {
                            try {
                                // The chart bridge's Highcharts instance, which
                                // also renders the chart in <Preview>
                                const charts = Highcharts.charts;
                                this.$chartBridge.init(charts[charts.length - 1] as Chart);
                                afterRecreate();
                            } finally {
                                setTimeout(() => this.$store.commit('viewStore/setLoadingChart', false), 1200);
                            }
                        });
                    }, 50);
                });
            }, 100);
        },
        importProject(fileContents: string) {
            if (fileContents) {
                this.cleanSlateAndRecreateChart(() => {
                    // After chart has been deleted and recreated, load in new options
                    try {
                        restoreFromProjectFile(fileContents, this.$store);
                        this.$announcer.announce('Project loaded.');
                    } catch (e) {
                        this.$announcer.announce('Error loading project.');
                        console.error('Error loading project:', e);
                    }
                });
            }
        },
        newProject() {
            if (window.confirm('This will clear all data and reset all settings. Proceed?')) {
                this.cleanSlateAndRecreateChart(() => {
                    // Restore Vuex state to default
                    this.$store.commit('dataStore/restoreStoreState');

                    // Hide chart temporarily to force full remount
                    this.$store.commit('viewStore/setShowChartComponent', false);

                    this.$nextTick(() => {
                        // Show chart again (triggers <Preview> remount and mounted() hook)
                        this.$store.commit('viewStore/setShowChartComponent', true);

                        // Announce once the new chart will be initialized (chart logic moved to Preview.vue)
                        this.$nextTick(() => {
                            this.$announcer.announce('New project loaded.');
                        });
                    });
                });
            }
        }

    }
});
</script>

<style lang="less" scoped>
</style>
