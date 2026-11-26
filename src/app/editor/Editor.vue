<!--
    Editor component is the root container for the editor. See src/app/public/app.ts for usage.
-->
<template>
    <div class="editor-container">
        <EditorHeader @skip-to-content="onSkipToContent" />
        <MainContentView
            id="mainContentView"
            ref="mainContentView"
        />
        <EditorFooter />
        <div ref="announcePolite" />
        <div ref="announceAssertive" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import Header from './components/Header.vue';
import MainContentView from './components/MainContentView.vue';
import Footer from './components/Footer.vue';
import { restoreAppState, storageKey, storageRevision } from './store/store';
import { useDataStore } from './store/modules/data';
import { useViewStore } from './store/modules/view';

export default defineComponent({
    components: {
        // Registered under other names, as <header> and <footer> are HTML elements
        EditorHeader: Header,
        MainContentView,
        EditorFooter: Footer,
    },
    computed: {
        ...mapStores(useDataStore, useViewStore),
    },
    mounted() {
        this.$announcer.init(
            this.$refs.announcePolite as HTMLElement,
            this.$refs.announceAssertive as HTMLElement
        );
        document.title = 'Editor | Highcharts Sonification Studio';
        this.initStore();
    },
    methods: {
        initStore() {
            this.clearOldStorageRevisions();
            const stateJSON = window.localStorage.getItem(storageKey + '-' + storageRevision);
            const isDev = import.meta.env.DEV;

            if (isDev) {
                console.log('Development mode: Skipped loading local storage app state.');
            }

            if (!isDev && stateJSON) {
                const restoredState = JSON.parse(stateJSON);
                restoreAppState(restoredState, this.$pinia);
            } else {
                // Also sets the CSV of the placeholder rows
                this.dataStore.setToPlaceholderData();
                this.$nextTick(() => {
                    this.viewStore.triggerDataReactivity();
                });
            }
        },

        clearOldStorageRevisions() {
            let i = storageRevision;
            while (i--) {
                window.localStorage.removeItem(storageKey + '-' + i);
            }
        },

        onSkipToContent() {
            (this.$refs.mainContentView as { skipToContent: () => void }).skipToContent();
        },
    },
});
</script>

<style lang="less" scoped>
@import 'colors';

.editor-container {
    width: 100%;
    min-width: 850px;
    height: 100%;
    min-height: 750px;
    max-height: 100%;
    margin: 0 auto;
    background-color: @app-bg-color;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

#mainContentView {
    flex: 1;
    margin-top: 4px;
    overflow-y: auto;
    /* Hack for not cutting off helptexts in the x-dimension, even if they overflow */
    padding-left: 110px;
    margin-left: -100px;
}
</style>
