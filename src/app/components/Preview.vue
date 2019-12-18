<template>
    <section aria-label="Chart preview">
        <div class="chart-container">
            <highcharts
                class="chart"
                :options="chartOptions"
            />
        </div>
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
        position: relative;
    }

    .chart-container {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }

    .chart {
        height: 100%;
    }
</style>
