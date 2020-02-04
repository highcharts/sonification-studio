<template>
    <section aria-label="Chart preview">
        <div
            class="chart-container"
            role="image"
            aria-label="Chart graphic"
        >
            <highcharts
                class="chart"
                aria-hidden="true"
                :options="chartOptions"
            />
        </div>
    </section>
</template>

<script lang="ts">
import { mapState } from 'vuex';

const defaultOptions = {
    chart: {
        type: 'spline',
        animation: {
            duration: 600
        }
    },
    title: {
        text: 'Test chart',
        style: {
            color: '#25386F',
            fontSize: '24px',
            fontFamily: 'Roboto'
        }
    },
    plotOptions: {
        series: {
            animation: false
        }
    },
    data: {
        csv: '',
        itemDelimiter: ';'
    }
};

export default {
    computed: {
        ...mapState('dataStore', ['tableCSV']),

        chartOptions() {
            const emptyCSV = 'x;y\n';
            return Object.assign({}, defaultOptions, {
                data: {
                    csv: this.tableCSV || emptyCSV
                }
            });
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    section {
        background-color: @main-content-bg-color;
        position: relative;
    }

    .chart-container {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        padding: 30px;
    }

    .chart {
        height: 100%;
    }
</style>
