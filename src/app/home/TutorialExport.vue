<template>
    <div>
        <p>Under the Export menu you can select different formats to export your project to.</p>
        <img
            alt="Export button clicked, and exporting option list expanded."
            loading="lazy"
            :src="exporting"
        >
        <ul role="list">
            <li><strong>Video</strong> will export to a video playing back the sonification. If the play marker setting is enabled (Audio / Global / Enable chart play marker), a marker will show along the chart as the sonification plays.</li>
            <li><strong>Audio only</strong> will export the sonification to an audio file, without the visual chart.</li>
            <li><strong>Audio as MIDI</strong> will export the sonification to a MIDI file, for further processing of the sounds.</li>
            <li><strong>Image</strong> will export the visual chart to a static PNG image.</li>
            <li><strong>Vector image</strong> will export the visual chart to a static SVG image. An SVG image will typically be smaller than a PNG image in filesize, and can be scaled to any size without becoming blurry.</li>
            <li><strong>CSV data</strong> will export the data to a text file that can be imported to Microsoft Excel or other data processing tools.</li>
            <li><strong>Text description</strong> will export the text description of the chart to a text file.</li>
            <li><strong>Highcharts JS Config</strong> will export the chart and sonification Javascript configuration needed to recreate the project using the <a href="https://www.highcharts.com">Highcharts JS</a> programming library.</li>
        </ul>
    </div>
</template>

<script lang="ts">
import exporting from './tutorialImages/exporting.png';

export default {
    data() {
        return { exporting };
    }
};

</script>

<style lang="less" scoped>
</style>
