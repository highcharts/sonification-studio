<template>
    <div class="play-buttons-container">
        <PlayButton
            ref="playPauseButton"
            :icon-path="playPauseIcon"
            @click="onPlayPauseClick"
        >
            {{ playing ? 'Pause' : 'Play' }}
        </PlayButton>
        <PlayButton
            ref="stopButton"
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
import { defineComponent } from 'vue';
import { keyPressed, Keys, Modifiers } from '../core/utils/keyboardUtils';
import { mapState } from 'pinia';
import { useViewStore } from '../store/modules/view';
import playIcon from '../assets/play.svg';
import stopIcon from '../assets/stop.svg';
import pauseIcon from '../assets/pause.svg';
import loopIcon from '../assets/loop.svg';
import PlayButton from './PlayButton.vue';
import PlayCheckbox from './PlayCheckbox.vue';

// The parts of PlayButton used here
type PlayButtonComponent = InstanceType<typeof PlayButton>;

export default defineComponent({
    components: {
        PlayButton, PlayCheckbox
    },
    data() {
        return {
            playing: false,
            paused: false,
            loopEnabled: false,
            // Loop was toggled with its keyboard shortcut, which announces it
            loopToggledByKey: false,
            stopListeningToBridge: null as null | (() => void),
            playPauseIcon: playIcon,
            stopIcon, pauseIcon, loopIcon
        };
    },
    computed: {
        ...mapState(useViewStore, ['selectedHeaderTabId', 'reactToParameterUpdates', 'reactToDataUpdates'])
    },
    // Stop playing when something changes.
    watch: {
        reactToParameterUpdates() {
            this.stopForChange();
        },
        reactToDataUpdates() {
            this.stopForChange();
        },
        loopEnabled(enabled: boolean) {
            const loopMessage = this.loopToggledByKey ?
                'Loop ' + (enabled ? 'enabled' : 'disabled') + '.' :
                '';
            this.loopToggledByKey = false;
            this.stopForChange(loopMessage);
        }
    },
    mounted() {
        document.addEventListener('keydown', this.onDocumentKeydown);
        // An audio or video export stops playback to play the chart itself
        this.stopListeningToBridge = this.$chartBridge.onPlaybackStopped(() => this.stopForChange());
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onDocumentKeydown);
        this.stopListeningToBridge?.();
    },
    methods: {
        onDocumentKeydown(e: KeyboardEvent) {
            if (this.selectedHeaderTabId === 'Chart') {
                if (keyPressed(Keys.K, Modifiers.Ctrl, e)) {
                    this.onPlayPauseClick();
                    e.preventDefault();
                } else if (keyPressed(Keys.R, Modifiers.Ctrl, e)) {
                    this.onStopClick();
                    e.preventDefault();
                } else if (keyPressed(Keys.T, Modifiers.Ctrl, e)) {
                    // The loopEnabled watcher announces the change
                    this.loopToggledByKey = true;
                    this.loopEnabled = !this.loopEnabled;
                    e.preventDefault();
                } else if (keyPressed(Keys.Left, Modifiers.Ctrl + Modifiers.Shift, e)) {
                    this.resetPlayPauseBtn();
                    this.$chartBridge.playAdjacent(false);
                } else if (keyPressed(Keys.Right, Modifiers.Ctrl + Modifiers.Shift, e)) {
                    this.resetPlayPauseBtn();
                    this.$chartBridge.playAdjacent(true);
                }
            }
            if (keyPressed(Keys.Esc, Modifiers.None, e)) {
                this.onStopClick();
            }
        },
        onPlayPauseClick() {
            this.paused = false;
            this.playPauseIcon = this.playing ? playIcon : pauseIcon;
            if (this.playing) {
                this.$chartBridge.pauseChart();
                this.paused = true;
            } else if (this.loopEnabled) {
                this.$chartBridge.playChart(void 0, true);
            } else {
                this.$chartBridge.playChart(this.resetPlayPauseBtn.bind(this));
            }
            this.playing = !this.playing;
        },
        resetPlayPauseBtn() {
            // The Stop button is disabled once nothing plays, which would
            // drop its focus to the page
            const stopButtonHadFocus = this.getButton('stopButton')?.contains(document.activeElement);
            this.paused = false;
            this.playing = false;
            this.playPauseIcon = playIcon;
            if (stopButtonHadFocus) {
                this.$nextTick(() => this.getButton('playPauseButton')?.focus());
            }
        },
        onStopClick() {
            this.paused = false;
            this.resetPlayPauseBtn();
            this.$chartBridge.stopChart();
        },
        // Stop playback for a change to the chart or the loop setting, and
        // say so if it was playing, before an optional message
        stopForChange(message = '') {
            const wasPlaying = this.playing;
            this.onStopClick();
            const announcement = [message, wasPlaying ? 'Playback stopped.' : '']
                .filter(Boolean)
                .join(' ');
            if (announcement) {
                this.$announcer.announce(announcement);
            }
        },
        getButton(ref: 'playPauseButton' | 'stopButton'): HTMLButtonElement | undefined {
            return (this.$refs[ref] as PlayButtonComponent | undefined)?.$el.querySelector('button') ?? void 0;
        }
    }
});
</script>

<style lang="less" scoped>
    .play-buttons-container {
        display: flex;
    }
</style>
