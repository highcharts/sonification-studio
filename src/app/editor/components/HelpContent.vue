<template>
    <div>
        <h1>Basics</h1>
        <p>
            This tool allows you to import or enter data, edit it, create visual and auditory visualizations, and export them together or separately.
        </p>
        <p>
            In the <span class="emp">Data</span> tab, import or edit your data in the data grid. This will automatically create a visual chart, which can be sonified.
        </p>
        <p>
            In the <span class="emp">Chart</span> tab, you can view the resulting chart, and modify the visualization as well as the sonification experience.
        </p>
        <p>
            When you are satisfied with the visual chart and the sonification experience, click the <span class="emp">Save Project</span> button to export your work. The chart and sonification can be combined and exported as a video, or you can export them separately. The data can also be exported separately.
        </p>

        <h1>Modifying the chart or sonification</h1>
        <p>
            Under the <span class="emp">Chart</span> tab, you will find a sidebar with <span class="emp">Visual</span> and <span class="emp">Audio</span> settings. Each of these have <span class="emp">Global settings</span>, that apply to the whole chart, and <span class="emp">Data series settings</span>, which apply to an individual data series. Each individual setting has a help icon next to it, offering more detailed information about the effect of the setting.
        </p>
        <p>
            The <span class="emp">Visual</span> settings tab will allow you to modify the chart, changing the look and feel, the chart type, the title, add labels, and so on.
        </p>
        <p>
            The <span class="emp">Audio</span> settings will allow you to modify the sonification parameters for the chart. This includes the playback speed, the frequency ranges, the mapping of data parameters to various properties of the sounds, and more.
        </p>

        <h1>Keyboard shortcuts</h1>
        <p>
            The following keyboard shortcuts can be used to control sonification playback when on the <span class="emp">Chart</span> tab:
            <ul>
                <li><span class="shortcut">Alt+P</span>: Play/pause sonification playback</li>
                <li><span class="shortcut">Alt+S</span>: Stop sonification playback</li>
                <li><span class="shortcut">Alt+L</span>: Loop sonification playback</li>
            </ul>
            On macOS, the Option-key corresponds to the Windows Alt-key.
        </p>
    </div>
</template>

<script lang="ts">
export default {};
</script>

<style lang="less" scoped>
    @import "../colors";

    h1, h2, h3 {
        color: @dark-blue-5;
        font-weight: bold;
        font-size: 1.3em;
        margin-bottom: 5px;
        margin-top: 20px;
    }

    h1:first-child {
        margin-top: 0;
    }

    p {
        margin-bottom: 10px;
    }

    p:last-child {
        margin-bottom: 0;
    }

    ul {
        margin: 10px 0;
        list-style-type: square;
        list-style-position: inside;
        padding-left: 10px;
    }

    .shortcut {
        font-family: 'Courier New', Courier, monospace;
    }

    .emp {
        background-color: #f5f5f5;
        z-index: 1;
        border-radius: 5px;
        padding: 1px 4px;
        color: @dark-blue-5;
    }

</style>
