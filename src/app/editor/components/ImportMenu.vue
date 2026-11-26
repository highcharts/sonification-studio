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
import { defineComponent } from 'vue';
import SEDropdownMenu from './basic/SEDropdownMenu.vue';
import menuIcon from '../assets/bars-solid.svg';
import csvIcon from '../assets/file-csv-solid.svg';

// A file upload item in SEDropdownMenu's options format
interface MenuFileUploadOption {
    label: string;
    icon: string;
    type: 'fileupload';
    onload: (fileContents: string) => void;
}

export default defineComponent({
    components: {
        SEDropdownMenu
    },
    data() {
        return {
            menuIcon,
            csvIcon
        };
    },
    computed: {
        menuOptions(): MenuFileUploadOption[] {
            return [{
                label: 'CSV Data',
                icon: csvIcon,
                type: 'fileupload',
                onload: (c: string) => this.importCSV(c)
            }];
        }
    },
    methods: {
        importCSV(fileContents: string) {
            if (fileContents) {
                this.$store.dispatch('dataStore/loadFromCSV', fileContents);
                this.$announcer.announce('Data loaded.');
            }
        }
    }
});
</script>

<style lang="less" scoped>
</style>
