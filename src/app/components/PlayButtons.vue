<template>
    <div class="play-buttons-container">
        <PlayButton
            :icon-path="playIcon"
            @click="$chartBridge.playChart()"
        >
            Play
        </PlayButton>
        <PlayButton
            :icon-path="stopIcon"
            @click="$chartBridge.stopChart()"
        >
            Stop
        </PlayButton>
        <PlayButton
            :icon-path="pauseIcon"
            @click="$chartBridge.pauseChart()"
        >
            Pause
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
            @click="$chartBridge.loopChart()"
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
            playIcon, stopIcon, pauseIcon, holdIcon, loopIcon
        };
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
