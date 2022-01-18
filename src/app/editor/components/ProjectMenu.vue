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
import SEDropdownMenu from './basic/SEDropdownMenu.vue';
import { downloadProjectFile, restoreFromProjectFile } from '../core/utils/projectFileHandling';
import projectIcon from '../assets/file-export-solid.svg';
import menuIcon from '../assets/bars-solid.svg';

export default {
    components: {
        SEDropdownMenu
    },
    data() {
        return {
            menuIcon,
            projectIcon,
            menuOptions: [{
                label: 'New project',
                icon: projectIcon,
                type: 'button',
                onclick: () => (this as any).newProject()
            }, {
                label: 'Open project',
                icon: projectIcon,
                type: 'fileupload',
                fileTypes: '.hssp',
                onload: (c: string) => (this as any).importProject(c)
            }, {
                label: 'Save project as',
                icon: projectIcon,
                type: 'button',
                onclick: () => (this as any).dlProject()
            }]
        };
    },
    methods: {
        dlProject() {
            const projectName = (this as any).$chartBridge.getChartTitleForExport();
            downloadProjectFile(projectName, this.$store);
        },
        cleanSlateAndRecreateChart(afterRecreate: Function) {
            this.$store.commit('seriesParametersStore/clearState');
            // Remove chart from DOM because chart.update does not remove series options
            // - even with one-to-one parameter set.
            this.$store.commit('viewStore/setLoadingChart', true);
            setTimeout(() => {
                this.$store.commit('viewStore/setShowChartComponent', false);
                this.$nextTick(() => {
                    // Recreate chart
                    this.$store.commit('viewStore/setShowChartComponent', true);
                    this.$nextTick(() => {
                        try {
                            afterRecreate();
                        } finally {
                            setTimeout(() => this.$store.commit('viewStore/setLoadingChart', false), 1200);
                        }
                    });
                });
            }, 100);
        },
        importProject(fileContents: string) {
            if (fileContents) {
                this.cleanSlateAndRecreateChart(() => {
                    // After chart has been deleted and recreated, load in new options
                    try {
                        restoreFromProjectFile(fileContents, this.$store);
                        (this as any).$announcer.announce('Project loaded.');
                    } catch (e) {
                        (this as any).$announcer.announce('Error loading project.');
                        console.error('Error loading project:', e);
                    }
                });
            }
        },
        newProject() {
            if (window.confirm('This will clear all data and reset all settings. Proceed?')) {
                this.cleanSlateAndRecreateChart(() => {
                    // Restore state with no argument restores defaults.
                    this.$store.dispatch('restoreState');
                    (this as any).$announcer.announce('New project loaded.');
                });
            }
        }
    }
};
</script>

<style lang="less" scoped>
</style>
