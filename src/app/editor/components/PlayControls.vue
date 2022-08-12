<template>
    <div
        role="region"
        class="playcontrols-container"
        aria-labelledby="playcontrols-heading"
    >
        <div class="playcontrols-inner-container">
            <h3
                id="playcontrols-heading"
                class="sr-only"
            >
                Play controls
            </h3>
            <PlayButtons class="playControlItem" />
            <PlaybackSlider class="playControlItem growLarge" />
            <VolumeSlider class="playControlItem growSmall" />
        </div>
    </div>
</template>

<script lang="ts">
import PlayButtons from './PlayButtons.vue';
import PlaybackSlider from './PlaybackSlider.vue';
import VolumeSlider from './VolumeSlider.vue';

export default {
    components: {
        PlayButtons,
        PlaybackSlider,
        VolumeSlider
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

    .playcontrols-container {
        box-sizing: border-box;
        width: 100%;
        background-color: @play-controls-container-color;
        padding: 5px;
        border-radius: 4px 4px 0 0;
    }

    .playcontrols-inner-container {
        width: 100%;
        background-color: @play-controls-bg;
        color: @play-controls-color;
        display: flex;
        align-items: center;
        padding: 5px;
        box-sizing: border-box;
        border: 1px solid @purple-7;
        border-radius: 4px;
    }

    .playControlItem {
        margin: 5px 8px;
    }

    .growLarge {
        flex: 3;
    }

    .growSmall {
        flex: 1;
    }
</style>
