<template>
    <div>
        <p>Similarly to the Chart configurations, the sonification settings can be adjusted in the sidebar under the main Chart tab.</p>
        <p>To configure the sonification settings, select the Audio tab in the sidebar.</p>
        <p>You can select between Global settings and Data series settings. Global settings are configuration options that apply to the entire chart, while Data series settings apply only to a specific data series - such as a specific line in a line chart.</p>
        <img
            alt="Sidebar with nested tab controls, showing the Audio tab selected."
            loading="lazy"
            :src="sidebarAudio"
        >

        <h3>Remove a data series from the sonification</h3>
        <p>A common use case is having data series that you do not want included in the sonification, but still presented visually. This can be configured under Data series settings / Instrument / Audio enabled for series. By deselecting this option, the data series will not be included in the sonification, but will still be visible. Hiding the data series visually can be done under the Visual settings.</p>
        <img
            alt="Sidebar showing the Audio enabled setting."
            loading="lazy"
            :src="audioEnabled"
        >

        <h3>Play detail and speed</h3>
        <p>These settings can be found under Global settings / Basic.</p>
        <p>Play speed refers to the duration of the sonification, and will affect how quickly the sonification is played.</p>
        <p>With Play detail, you can adjust the detail level of the sonification - how many notes are played. This does not affect the data, or the play duration. When detail is low, and few notes are played, the tool will group data together and play each group as one. The minimum and maximum of each group will be played, to preserve peaks in the data.</p>
        <img
            alt=""
            loading="lazy"
            :src="sidebarBasic"
        >

        <h3>Audio mapping</h3>
        <p>Under settings for each data series, you can adjust how the data is mapped to sound.</p>
        <p>For each series, you can select an instrument sound. Both melodic and percussive instrument presets are available. For more realistic sounding instruments, you may want to export your sonification as MIDI, and import it into a Digital Audio Workstation (DAW) of your choice.</p>
        <p>You can map the data values to several audio parameters, including pitch, panning, volume, and duration. You can also map data values to sound effects, like tremolo, and filters.</p>
        <img
            alt="Sidebar showing volume mapped to Y-values, with minimum and maximum settings."
            loading="lazy"
            :src="audioMapped"
        >
        <p>For example, mapping the Y-values to volume from low to high would cause the audio to get louder when the Y-values go up, and go quieter as the Y-values go down.</p>
        <p>You can also select fixed values for the parameters, such as a fixed volume for a data series.</p>
        <img
            alt="Sidebar showing volume set to a fixed value of 100."
            loading="lazy"
            :src="audioFixed"
        >

        <h3>Contexts</h3>
        <p>Under Global settings, you can add "Global audio context cues". These are sounds that play in the background along with the sonification, to add context. For example, you may want to play a click for every tick mark on the X-axis, to give the listener a better sense of time as the sonification plays.</p>
        <p>Currently, you can only add context cues based on X-axis values.</p>
        <p>You can define when the sound(s) will play, and there are basic settings for which sound to play.</p>
        <img
            alt="Sidebar showing one context cue added, with settings for sound type and when to play."
            loading="lazy"
            :src="contexts"
        >
    </div>
</template>

<script lang="ts">
import sidebarAudio from './tutorialImages/sidebarAudio.png';
import audioEnabled from './tutorialImages/audioEnabled.png';
import sidebarBasic from './tutorialImages/sidebarBasic.png';
import audioMapped from './tutorialImages/audioMapped.png';
import audioFixed from './tutorialImages/audioFixed.png';
import contexts from './tutorialImages/contexts.png';

export default {
    data() {
        return { sidebarAudio, audioEnabled, sidebarBasic, audioMapped, audioFixed, contexts };
    }
};

</script>

<style lang="less" scoped>
</style>
