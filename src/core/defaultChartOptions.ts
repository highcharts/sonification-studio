export const defaultChartOptions = {
    chart: {
        animation: {
            duration: 600
        }
    },
    exporting: {
        enabled: false,
        sourceWidth: 900
    },
    accessibility: {
        screenReaderRegion: {
            beforeChartFormat: '<h5>{chartTitle}</h5>' +
                '<div>{chartSubtitle}</div>' +
                '<div>{chartLongdesc}</div>' +
                '<div>{xAxisDescription}</div>' +
                '<div>{yAxisDescription}</div>'
        }
    },
    sonification: {
        enabled: true,
        afterSeriesWait: 600,
        order: 'simultaneous',
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
        itemDelimiter: ';',
        firstRowAsNames: false
    }
};
