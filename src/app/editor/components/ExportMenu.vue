<template>
    <div class="export-container">
        <SEDropdownMenu
            button-text="Export"
            :button-icon="menuIcon"
            :options="menuOptions"
        />

        <transition name="fade-in">
            <SEModalMessage v-show="rendering">
                <img
                    alt=""
                    class="spinnerIcon"
                    :src="spinnerIcon"
                >
                <span class="render-message">Rendering</span>
            </SEModalMessage>
        </transition>
    </div>
</template>

<script lang="ts">
import { downloadURI } from '../core/utils/browserUtils';
import menuIcon from '../assets/bars-solid.svg';
import jsIcon from '../assets/js-square-brands.svg';
import pictureIcon from '../assets/image-regular.svg';
import videoIcon from '../assets/film-solid.svg';
import musicIcon from '../assets/music-solid.svg';
import textIcon from '../assets/quote-right-solid.svg';
import csvIcon from '../assets/file-csv-solid.svg';
import htmlIcon from '../assets/file-code-solid.svg';
import spinnerIcon from '../assets/spinner-solid.svg';
import SEDropdownMenu from './basic/SEDropdownMenu.vue';
import SEModalMessage from './basic/SEModalMessage.vue';

export default {
    components: {
        SEDropdownMenu,
        SEModalMessage
    },
    data() {
        return {
            menuIcon,
            spinnerIcon,
            rendering: false,
            menuOptions: [{
                label: 'Video',
                icon: videoIcon,
                type: 'button',
                onclick: () => (this as any).dlVideo()
            }, {
                label: 'Audio Only',
                icon: musicIcon,
                type: 'button',
                onclick: () => (this as any).dlAudio()
            }, {
                label: 'Audio as MIDI',
                icon: musicIcon,
                type: 'button',
                onclick: () => (this as any).dlMIDI()
            }, {
                label: 'Image',
                icon: pictureIcon,
                type: 'button',
                onclick: () => (this as any).dlPNG()
            }, {
                label: 'Vector Image',
                icon: pictureIcon,
                type: 'button',
                onclick: () => (this as any).dlSVG()
            }, {
                label: 'CSV Data',
                icon: csvIcon,
                type: 'button',
                onclick: () => (this as any).dlCSV()
            }, {
                label: 'Text Description',
                icon: textIcon,
                type: 'button',
                onclick: () => (this as any).dlTextDesc()
            }, {
                label: 'Highcharts JS Config',
                icon: jsIcon,
                type: 'button',
                onclick: () => (this as any).dlChartConfig()
            }, {
                label: 'HTML file',
                icon: htmlIcon,
                type: 'button',
                onclick: () => (this as any).dlHTMLFile()
            }]
        };
    },
    methods: {
        dlVideo() {
            const announcer = (this as any).$announcer;
            const component = this;
            this.rendering = true;
            let waitAnnouncer: number;

            (function waitAnnounce() {
                if (component.rendering) {
                    announcer.announce('Rendering video, please wait.');
                    waitAnnouncer = setTimeout(waitAnnounce, 6000);
                }
            }());

            const fail = (e: Error) => {
                clearTimeout(waitAnnouncer);
                this.rendering = false;
                console.error('Render to video error:', e);
                window.alert('Saving to video failed. Error: ' + e.message);
            };

            try {
                (this as any).$chartBridge.downloadVideo(24).then(() => {
                    clearTimeout(waitAnnouncer);
                    this.rendering = false;
                    announcer.announce('Rendering done.');
                }).catch(fail);
            } catch (e) {
                fail(e);
            }
        },

        dlAudio() {
            const component = this;
            const announcer = (this as any).$announcer;
            this.rendering = true;
            let waitAnnouncer = 0;

            (function waitAnnounce() {
                if (component.rendering) {
                    announcer.announce('Rendering audio, please wait.');
                    waitAnnouncer = setTimeout(waitAnnounce, 6000);
                }
            }());

            const fail = (e: Error) => {
                clearTimeout(waitAnnouncer);
                this.rendering = false;
                console.error('Render to audio error:', e);
                window.alert('Saving to audio failed. Error: ' + e.message);
            };

            try {
                (this as any).$chartBridge.downloadAudio().then(() => {
                    this.rendering = false;
                    clearTimeout(waitAnnouncer);
                    announcer.announce('Rendering done.');
                }).catch(fail);
            } catch (e) {
                fail(e);
            }
        },

        dlMIDI() {
            (this as any).$chartBridge.downloadMIDI();
        },

        dlSVG() {
            (this as any).$chartBridge.downloadSVG();
        },

        dlPNG() {
            (this as any).$chartBridge.downloadPNG();
        },

        dlCSV() {
            downloadURI(
                this.$store.getters['dataStore/tableCSVDataURI'],
                (this as any).$chartBridge.getChartTitleForExport() + '.csv'
            );
        },

        dlTextDesc() {
            const desc = this.$store.state.dataStore.textDescription;
            if (desc) {
                downloadURI(
                    'data:text/plain;charset=UTF-8,' + encodeURIComponent(desc),
                    (this as any).$chartBridge.getChartTitleForExport() + '.txt'
                );
            } else {
                alert('No text description has been created. Generate an automatic text description or write your own in the "Chart" tab.');
            }
        },

        dlChartConfig() {
            (this as any).$chartBridge.downloadChartConfig();
        },

        dlHTMLFile() {
            (this as any).$chartBridge.downloadHTMLFile();
        }
    }
};
</script>

<style lang="less" scoped>
    .render-message {
        display: block;
    }

    .spinnerIcon {
        width: 32px;
        height: 32px;
        display: block;
        margin: 0 auto 10px;
        animation-name: spin;
        animation-duration: 2000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }

    @keyframes spin {
        from {
            filter: hue-rotate(0deg);
            opacity: 1;
            transform: rotate(0deg);
        }
        50% {
            opacity: 0.3
        }
        to {
            filter: hue-rotate(360deg);
            opacity: 1;
            transform: rotate(360deg);
        }
    }

    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }

    .fade-in-enter-active, .fade-in-leave-active {
        transition: all 0.25s ease;
    }
</style>
