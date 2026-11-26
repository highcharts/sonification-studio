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
import { defineComponent } from 'vue';
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

// A button item in SEDropdownMenu's options format
interface MenuButtonOption {
    label: string;
    icon: string;
    type: 'button';
    onclick: () => void;
}

export default defineComponent({
    components: {
        SEDropdownMenu,
        SEModalMessage
    },
    data() {
        return {
            menuIcon,
            spinnerIcon,
            rendering: false
        };
    },
    computed: {
        menuOptions(): MenuButtonOption[] {
            return [{
                label: 'Video',
                icon: videoIcon,
                type: 'button',
                onclick: () => this.dlVideo()
            }, {
                label: 'Audio Only',
                icon: musicIcon,
                type: 'button',
                onclick: () => this.dlAudio()
            }, {
                label: 'Audio as MIDI',
                icon: musicIcon,
                type: 'button',
                onclick: () => this.dlMIDI()
            }, {
                label: 'Image',
                icon: pictureIcon,
                type: 'button',
                onclick: () => this.dlPNG()
            }, {
                label: 'Vector Image',
                icon: pictureIcon,
                type: 'button',
                onclick: () => this.dlSVG()
            }, {
                label: 'CSV Data',
                icon: csvIcon,
                type: 'button',
                onclick: () => this.dlCSV()
            }, {
                label: 'Text Description',
                icon: textIcon,
                type: 'button',
                onclick: () => this.dlTextDesc()
            }, {
                label: 'Highcharts JS Config',
                icon: jsIcon,
                type: 'button',
                onclick: () => this.dlChartConfig()
            }, {
                label: 'HTML file',
                icon: htmlIcon,
                type: 'button',
                onclick: () => this.dlHTMLFile()
            }];
        }
    },
    methods: {
        dlVideo() {
            const announcer = this.$announcer;
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
                this.$chartBridge.downloadVideo(24).then(() => {
                    clearTimeout(waitAnnouncer);
                    this.rendering = false;
                    announcer.announce('Rendering done.');
                }).catch(fail);
            } catch (e) {
                fail(e as Error);
            }
        },

        dlAudio() {
            const component = this;
            const announcer = this.$announcer;
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
                this.$chartBridge.downloadAudio().then(() => {
                    this.rendering = false;
                    clearTimeout(waitAnnouncer);
                    announcer.announce('Rendering done.');
                }).catch(fail);
            } catch (e) {
                fail(e as Error);
            }
        },

        dlMIDI() {
            this.$chartBridge.downloadMIDI();
        },

        dlSVG() {
            this.$chartBridge.downloadSVG();
        },

        dlPNG() {
            this.$chartBridge.downloadPNG();
        },

        dlCSV() {
            downloadURI(
                this.$store.getters['dataStore/tableCSVDataURI'],
                this.$chartBridge.getChartTitleForExport() + '.csv'
            );
        },

        dlTextDesc() {
            const desc = this.$store.state.dataStore.textDescription;
            if (desc) {
                downloadURI(
                    'data:text/plain;charset=UTF-8,' + encodeURIComponent(desc),
                    this.$chartBridge.getChartTitleForExport() + '.txt'
                );
            } else {
                alert('No text description has been created. Generate an automatic text description or write your own in the "Chart" tab.');
            }
        },

        dlChartConfig() {
            this.$chartBridge.downloadChartConfig();
        },

        dlHTMLFile() {
            this.$chartBridge.downloadHTMLFile();
        }
    }
});
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

    .fade-in-enter-from, .fade-in-leave-to {
        opacity: 0;
    }

    .fade-in-enter-active, .fade-in-leave-active {
        transition: all 0.25s ease;
    }
</style>
