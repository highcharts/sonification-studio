<template>
    <div class="play-buttons-container">
        <PlayButton
            :icon-path="playPauseIcon"
            @click="onPlayPauseClick"
        >
            {{ playing ? 'Pause' : 'Play' }}
        </PlayButton>
        <PlayButton
            :icon-path="stopIcon"
            :enabled="playing || paused"
            @click="onStopClick"
        >
            Stop
        </PlayButton>
        <PlayCheckbox
            v-model="loopEnabled"
            :icon-path="loopIcon"
        >
            Loop
        </PlayCheckbox>
    </div>
</template>

<script lang="ts">
import { keyPressed, Keys, Modifiers } from '../core/utils/keyboardUtils';
import { mapState } from 'vuex';
import playIcon from '../assets/play.svg';
import stopIcon from '../assets/stop.svg';
import pauseIcon from '../assets/pause.svg';
import loopIcon from '../assets/loop.svg';
import PlayButton from './PlayButton.vue';
import PlayCheckbox from './PlayCheckbox.vue';

export default {
    components: {
        PlayButton, PlayCheckbox
    },
    data() {
        return {
            playing: false,
            paused: false,
            loopEnabled: false,
            playPauseIcon: playIcon,
            stopIcon, pauseIcon, loopIcon
        };
    },
    computed: mapState({
        selectedHeaderTabId: (state: any) => state.viewStore.selectedHeaderTabId,
        reactToParameterUpdates: (state: any) => state.viewStore.reactToParameterUpdates,
        reactToDataUpdates: (state: any) => state.dataStore.reactToDataUpdates,
    }),
    // Stop playing when something changes.
    watch: {
        reactToParameterUpdates() {
            this.onStopClick();
        },
        reactToDataUpdates() {
            this.onStopClick();
        },
        loopEnabled() {
            this.onStopClick();
        }
    },
    mounted() {
        document.addEventListener('keydown', (e) => {
            if (this.selectedHeaderTabId === 'Chart') {
                if (keyPressed(Keys.K, Modifiers.Ctrl, e)) {
                    this.onPlayPauseClick();
                    e.preventDefault();
                } else if (keyPressed(Keys.R, Modifiers.Ctrl, e)) {
                    this.onStopClick();
                    e.preventDefault();
                } else if (keyPressed(Keys.T, Modifiers.Ctrl, e)) {
                    this.loopEnabled = !this.loopEnabled;
                    (this as any).$announcer.announce('Loop ' + (this.loopEnabled ? 'enabled' : 'disabled') + '.');
                    e.preventDefault();
                } else if (keyPressed(Keys.Left, Modifiers.Ctrl + Modifiers.Shift, e)) {
                    this.resetPlayPauseBtn();
                    (this as any).$chartBridge.playAdjacent(false);
                } else if (keyPressed(Keys.Right, Modifiers.Ctrl + Modifiers.Shift, e)) {
                    this.resetPlayPauseBtn();
                    (this as any).$chartBridge.playAdjacent(true);
                }
            }
            if (keyPressed(Keys.Esc, Modifiers.None, e)) {
                this.onStopClick();
            }
        });
    },
    methods: {
        onPlayPauseClick() {
            this.paused = false;
            this.playPauseIcon = this.playing ? playIcon : pauseIcon;
            if (this.playing) {
                (this as any).$chartBridge.pauseChart();
                this.paused = true;
            } else if (this.loopEnabled) {
                (this as any).$chartBridge.loopChart();
            } else {
                (this as any).$chartBridge.playChart(this.resetPlayPauseBtn.bind(this));
            }
            this.playing = !this.playing;
        },
        resetPlayPauseBtn() {
            this.paused = false;
            this.playing = false;
            this.playPauseIcon = playIcon;
        },
        onStopClick() {
            this.paused = false;
            this.resetPlayPauseBtn();
            (this as any).$chartBridge.stopChart();
        }
    }
};
</script>

<style lang="less" scoped>
    .play-buttons-container {
        display: flex;
    }
</style>
