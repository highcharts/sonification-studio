<template>
    <div>
        <h1>Basics</h1>
        <p>
            This tool allows you to import or enter data, edit it, create visual and auditory visualizations, and export them together or separately.
        </p>
        <p>
            In the Data tab, import or edit your data in the data grid. This will automatically create a visual chart, which can be sonified.
        </p>
        <p>
            In the Chart tab, you can view the resulting chart, and modify the visualization as well as the sonification experience.
        </p>
        <p>
            When you are satisfied with the visual chart and the sonification experience, click the "Save Project" button to export your work. The chart and sonification can be combined and exported as a video, or you can export them separately. The data can also be exported separately.
        </p>

        <h1>Modifying the chart or sonification</h1>
        <p>
            Under the Chart tab, you will find a sidebar with Visual and Audio settings. Each of these have Global settings, that apply to the whole chart, and Data series settings, which apply to an individual data series. Each individual setting has a help icon next to it, offering more detailed information about the effect of the setting.
        </p>
        <p>
            The Visual settings tab will allow you to modify the chart, changing the look and feel, the chart type, the title, add labels, and so on.
        </p>
        <p>
            The Audio settings will allow you to modify the sonification parameters for the chart. This includes the playback speed, the frequency ranges, the mapping of data parameters to various properties of the sounds, and more.
        </p>

        <h1>Further assistance</h1>
        <p>
            Should you require further assistance, or encounter any issues using the tool, please do not hesitate to reach out to us. Contact information can be found on the home page of this project.
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

</style>
