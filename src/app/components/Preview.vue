<template>
    <section aria-label="Chart preview">
        <highcharts
            class="chart"
            :options="chartOptions"
        />
    </section>
</template>

<script lang="ts">
export default {
    data: function () {
        return {
            chartOptions: {
                title: {
                    text: 'Test chart',
                    style: {
                        color: '#25386F',
                        fontSize: '24px',
                        fontFamily: 'Roboto'
                    }
                },
                series: [{
                    data: [1, 2, 3, 4, 5, 6, 3, 2, 1, 6, 4, 3]
                }]
            }
        };
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        background-color: @main-content-bg-color;
        padding: 30px;
    }

    .chart {
        height: 100%;
    }
</style>
