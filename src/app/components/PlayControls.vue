<template>
    <section aria-label="Play controls">
        <PlayButtons class="playControlItem" />
        <PlaybackSlider class="playControlItem growLarge" />
        <VolumeSlider class="playControlItem growSmall" />
    </section>
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

    section {
        width: 100%;
        background-color: @play-controls-bg;
        color: @play-controls-color;
        display: flex;
        align-items: center;
        padding: 5px;
        box-sizing: border-box;
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
