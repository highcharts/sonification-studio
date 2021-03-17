export const defaultChartOptions = {
    chart: {
        animation: {
            duration: 600
        },
        zoomType: 'x'
    },
    exporting: {
        enabled: false,
        sourceWidth: 900,
        chartOptions: {
            title: {
                style: {
                    fontFamily: 'Verdana, sans-serif',
                    fontSize: '22px'
                }
            },
        }
    },
    accessibility: {
        screenReaderSection: {
            beforeChartFormat: '<div>{chartTitle}</div>' +
                '<div>{typeDescription}</div>' +
                '<div>{chartSubtitle}</div>' +
                '<div>{chartLongdesc}</div>' +
                '<div>{xAxisDescription}</div>' +
                '<div>{yAxisDescription}</div>'
        },
        landmarkVerbosity: 'one',
        series: {
            pointDescriptionEnabledThreshold: 50
        }
    },
    sonification: {
        enabled: true,
        afterSeriesWait: 600,
        order: 'simultaneous',
        masterVolume: 0.3,
        // Reset on end
        onEnd: function (e: any) {
            e.path.timeline.resetCursor();
        },
        defaultInstrumentOptions: {
            instrument: 'sineMusical',
            minDuration: 40,
            maxDuration: 3000,
            mapping: {
                duration: 400,
                frequency: 'y',
                volume: 1,
                pointPlayTime: 'x'
            }
        }
    },
    title: {
        text: 'Test chart',
        style: {
            color: '#25386F',
            fontSize: '24px',
            fontFamily: 'Roboto, sans-serif'
        }
    },
    plotOptions: {
        series: {
            animation: false,
            dataGrouping: {
                enabled: true,
                groupPixelWidth: 3
            }
        },
        scatter: {
            marker: {
                enabled: true
            }
        }
    },
    navigator: {
        enabled: false
    },
    rangeSelector: {
        enabled: false
    },
    scrollbar: {
        enabled: false
    },
    yAxis: {
        opposite: false
    },
    xAxis: {
        type: 'linear'
    },
    data: {
        csv: '',
        itemDelimiter: ';',
        firstRowAsNames: false
    }
};
