<template>
    <div>
        <p>There are multiple ways to get your data into the Highcharts Sonification Studio to get started:</p>
        <h3>Data grid</h3>
        <p>Data can be entered directly into the data grid spreadsheet.</p>
        <p>The first column contains the X values of the resulting chart. The second column will be the Y values. If you add more columns, they will signify Y values of additional data series. For a regular line chart, this means additional lines.</p>
        <p>In the first row you can put column headers. The column headers will determine the default names of your data series unless you change them in the chart configuration.</p>
        <img
            alt="Data grid showing two columns of numbers. Below is the resulting line chart."
            :src="gridAndChartBasic"
        >
        <p>Empty cells will be treated as <code>null</code> values, and represent missing data.</p>
        <img
            alt="Data grid showing some numbers missing in the second column. Below is the resulting line chart with missing segments."
            :src="gridAndChartNull"
        >
        <p>It is possible to use text for the X values, which can be useful for certain types of charts.</p>
        <img
            alt="Data grid with text in the first column, numbers in the second. Below is the resulting column chart with text for each column on the X axis."
            :src="gridAndChartText"
        >
        <p>Clicking the Grid Tools button will expand a toolbar with additional functionality for the data grid. You can add more rows to the grid, clear/empty the grid, or fill columns with the result of an equation.</p>
        <img
            alt=""
            :src="gridTools"
        >
        <h3>Import CSV data</h3>
        <p>It is possible to import existing CSV data into the grid, from the Import menu. Most data analysis tools will allow you to save data in this format.</p>
        <img
            alt=""
            :src="importCSV"
        >
        <h3>Google Sheet</h3>
        <p>Instead of using the grid, you can select to use a Google Sheet as a data source. The data is automatically kept up to date with future changes to the Google Sheet.</p>
        <p>When you select to use a Google Sheet as a source, the tool will guide you through the process of setting up the necessary configuration in order to access your Google Sheet.</p>
        <img
            alt=""
            :src="googleSheet"
        >
    </div>
</template>

<script lang="ts">

import gridAndChartBasic from './tutorialImages/gridAndChartBasic.png';
import gridAndChartNull from './tutorialImages/gridAndChartNull.png';
import gridTools from './tutorialImages/gridTools.png';
import gridAndChartText from './tutorialImages/gridAndChartText.png';
import importCSV from './tutorialImages/importCSV.png';
import googleSheet from './tutorialImages/googleSheet.png';

export default {
    data() {
        return { gridAndChartBasic, gridAndChartNull, gridTools, gridAndChartText, importCSV, googleSheet };
    }
};

</script>

<style lang="less" scoped>
</style>
