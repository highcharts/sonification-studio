<template>
    <div class="import-container">
        <SEDropdownMenu
            button-text="Import"
            :button-icon="menuIcon"
            :options="menuOptions"
        />
    </div>
</template>

<script lang="ts">
import SEDropdownMenu from './basic/SEDropdownMenu.vue';
import menuIcon from '../assets/bars-solid.svg';
import csvIcon from '../assets/file-csv-solid.svg';

export default {
    components: {
        SEDropdownMenu
    },
    data() {
        return {
            menuIcon,
            csvIcon,
            menuOptions: [{
                label: 'CSV Data',
                icon: csvIcon,
                type: 'fileupload',
                onload: (c: string) => (this as any).importCSV(c)
            }]
        };
    },
    methods: {
        importCSV(fileContents: string) {
            if (fileContents) {
                this.$store.dispatch('dataStore/loadFromCSV', fileContents);
                (this as any).$announcer.announce('Data loaded.');
            }
        }
    }
};
</script>

<style lang="less" scoped>
</style>
