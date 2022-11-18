<template>
    <div>
        <p>Selecting the Chart tab, you can see the resulting chart from your data, and make changes to the chart and sonification configurations in the sidebar.</p>
        <p>To configure the visual chart, select the Visual tab in the sidebar.</p>
        <p>You can select between Global settings and Data series settings. Global settings are configuration options that apply to the entire chart, while Data series settings apply only to a specific data series - such as a specific line in a line chart.</p>
        <img
            alt="Sidebar with nested tab controls, showing the Visual tab selected."
            loading="lazy"
            :src="sidebar"
        >

        <h3>Chart types</h3>
        <p>The application supports multiple types of visualizations, including basic line, column, and pie charts, as well as scatter plots.</p>
        <p>You can set the default type for all data series under Global settings, and override the type for specific data series under Data series settings. This allows you to combine multiple chart types in one chart.</p>
        <img
            alt=""
            loading="lazy"
            :src="commonChartTypes"
        >
        <p>The less common chart types included are:</p>
        <h4>Smoothed line charts</h4>
        <p>These are line charts that draw arcs between points instead of straight lines, smoothing the overall flow of the line. The data and sonification is not smoothed, only the visual line.</p>
        <img
            alt=""
            loading="lazy"
            :src="smoothedLine"
        >
        <h4>Area charts</h4>
        <p>These are line charts where the area between the line and the x-axis has been "colored in", or filled. Area charts are often used to visually signal that the values show an accumulated total or volume. They are also sometimes referred to as "mountain charts" since they may look like a drawing of a mountain range.</p>
        <img
            alt=""
            loading="lazy"
            :src="area"
        >
        <h4>Smoothed area charts</h4>
        <p>As with smoothed line charts, these are area charts with visual smoothing of the line.</p>
        <img
            alt=""
            loading="lazy"
            :src="smoothedArea"
        >

        <h3>Hide a data series</h3>
        <p>A common use case is having data in the data set that you do not want to include in the chart or the sonification. You can choose to not include a data series in the chart and sonification by going to "Data series settings" and deselecting the "Series visible" option. Note that the data series will still show up in the chart legend (if legend is enabled), and can be made visible again by clicking in the legend. If you also wish to exclude the data series from the legend, you will have to remove it from the data set.</p>
        <img
            alt=""
            loading="lazy"
            :src="seriesVisible"
        >

        <h3>Zooming</h3>
        <p>Click-and-drag zooming along the X-axis is enabled by default. This also affects the sonification, as only the zoomed area is sonified. You can control the zoom options under "Global settings" / "Advanced" / "Chart zoom".</p>

        <h3>Legend and series labels</h3>
        <p>In some cases you may want to enable an explanatory chart legend, showing which data series are present in the chart. This can be done under "Global settings" / "Advanced" / "Enable legend". Note that in many cases, enabling data series labels (also under "Global settings" / "Advanced") may be a better user experience, and make the chart easier to follow.</p>
        <img
            alt=""
            loading="lazy"
            :src="legend"
        >

        <h3>Axis types</h3>
        <p>For each axis, you can select between multiple types: Linear, logarithmic, category, and date. The tool will try to make an intelligent guess based on your data set. Category axes are used for text, while date axes are used for data with timestamps. Several date formats are supported, but a safe and unambiguous bet is YYYY/MM/DD. Alternatively, you can use the number of elapsed milliseconds since January 1, 1970, UTC (<a href="https://en.wikipedia.org/wiki/Unix_time">UNIX Epoch</a>), and manually set the axis type to Date.</p>
        <p>Note that when using Date axis types, configuring the min/max values for the axis currently requires using elapsed milliseconds since the UNIX Epoch (Jan 1st, 1970).</p>
        <img
            alt=""
            loading="lazy"
            :src="axisTypes"
        >
    </div>
</template>

<script lang="ts">

import sidebar from './tutorialImages/sidebar.png';
import commonChartTypes from './tutorialImages/commonChartTypes.png';
import smoothedLine from './tutorialImages/smoothedLine.png';
import smoothedArea from './tutorialImages/smoothedArea.png';
import area from './tutorialImages/area.png';
import seriesVisible from './tutorialImages/seriesVisible.png';
import legend from './tutorialImages/legend.png';
import axisTypes from './tutorialImages/axisTypes.png';

export default {
    data() {
        return { sidebar, commonChartTypes, smoothedLine, smoothedArea, area, seriesVisible, legend, axisTypes };
    }
};

</script>

<style lang="less" scoped>
</style>
