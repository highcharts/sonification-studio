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
            @click="onStopClick"
        >
            Stop
        </PlayButton>
        <PlayButton
            :icon-path="holdIcon"
            @mousedown="$chartBridge.pauseChart()"
            @mouseup="$chartBridge.isPaused() && $chartBridge.playChart()"
            @keydown.space="$chartBridge.pauseChart()"
            @keyup.space="$chartBridge.isPaused() && $chartBridge.playChart()"
        >
            Hold
        </PlayButton>
        <PlayButton
            :icon-path="loopIcon"
            @click="onLoopClick"
        >
            Loop
        </PlayButton>
    </div>
</template>

<script lang="ts">
import playIcon from '../assets/play.svg';
import stopIcon from '../assets/stop.svg';
import pauseIcon from '../assets/pause.svg';
import holdIcon from '../assets/hold.svg';
import loopIcon from '../assets/loop.svg';
import PlayButton from './PlayButton.vue';

export default {
    components: {
        PlayButton
    },
    data() {
        return {
            playing: false,
            looping: false,
            playPauseIcon: playIcon,
            stopIcon, pauseIcon, holdIcon, loopIcon
        };
    },
    methods: {
        onPlayPauseClick() {
            this.playPauseIcon = this.playing ? playIcon : pauseIcon;
            if (this.playing) {
                this.$chartBridge.pauseChart();
            } else if (this.looping) {
                this.$chartBridge.loopChart();
            } else {
                this.$chartBridge.playChart(this.resetPlayPauseBtn.bind(this));
            }
            this.playing = !this.playing;
        },
        onLoopClick() {
            this.playing = true;
            this.looping = true;
            this.playPauseIcon = pauseIcon;
            this.$chartBridge.loopChart();
        },
        resetPlayPauseBtn() {
            this.playing = false;
            this.playPauseIcon = playIcon;
        },
        onStopClick() {
            this.looping = false;
            this.resetPlayPauseBtn();
            this.$chartBridge.stopChart();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    .play-buttons-container {
        display: flex;
    }

    .play-button {
        margin: 0 5px;
    }
</style>
