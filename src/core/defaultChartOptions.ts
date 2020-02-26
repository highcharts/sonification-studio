export const defaultChartOptions = {
    chart: {
        animation: {
            duration: 600
        }
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
        afterSeriesWait: 1000,
        order: 'sequential',
        pointPlayTime: 'x',
        // Reset on end
        onEnd: function (e: any) {
            e.path.timeline.resetCursor();
        },
        instruments: [{
            instrument: 'sineMusical',
            instrumentMapping: {
                duration: 400,
                frequency: 'y',
                volume: 1
            }
        }]
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
