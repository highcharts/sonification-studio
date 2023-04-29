import { GenericObject } from './utils/objects';
import { getChartStatistics } from './utils/chartUtils';

export const defaultChartOptions = {
    lang: {
        accessibility: {
            chartTypes: {
                splineSingle: 'Smoothed line chart.',
                splineMultiple: 'Smoothed line chart.',
                lineSingle: 'Line chart.',
                lineMultiple: 'Line chart.',
                pieSingle: 'Pie chart.',
                pieMultiple: 'Pie chart.',
                columnSingle: 'Column chart.',
                columnMultiple: 'Column chart.',
                scatterSingle: 'Scatter chart.',
                scatterMultiple: 'Scatter chart.',
                areasplineSingle: 'Smoothed area chart.',
                areasplineMultiple: 'Smoothed area chart.'
            }
        }
    },
    chart: {
        animation: {
            duration: 600
        },
        panKey: 'alt',
        events: {
            afterA11yUpdate: function () {
                const svg = (this as any).renderer.box;
                svg.setAttribute('role', 'application');
            }
        }
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
            credits: {
                enabled: true
            }
        }
    },
    accessibility: {
        screenReaderSection: {
            beforeChartFormatter: function (chart: Highcharts.Chart) {
                const title = chart.options.title?.text;
                const titleTag = `<h3>Chart preview${title ? ': ' + title : ''}</h3>`;
                const component = (chart as GenericObject).accessibility.components.infoRegions;
                const typeDesc = component.getTypeDescriptionText();
                const subtitle = component.getSubtitleText();
                const statistics = getChartStatistics(chart);
                return (
                    titleTag +
                    `<div>${typeDesc}</div>` +
                    `<div>${subtitle}</div>` +
                    `<div>${statistics}</div>` +
                    '<div>Skip to next heading to go to end of chart.</div>'
                ).replace('<div></div>', '');
            },
            afterChartFormat: ''
        },
        landmarkVerbosity: 'disabled',
        series: {
            pointDescriptionEnabledThreshold: 8000
        }
    },
    sonification: {
        afterSeriesWait: 600,
        order: 'simultaneous',
        masterVolume: 0.7,
        updateInterval: 50,
        defaultInstrumentOptions: {
            roundToMusicalNotes: false,
            mapping: {
                tremolo: {
                    speed: 0.55
                }
            },
            pointGrouping: {
                enabled: true,
                groupTimespan: 40,
                algorithm: 'minmax',
                prop: 'y'
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
            },
            cropThreshold: 1
        },
        pie: {
            dataGrouping: {
                enabled: false
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
    tooltip: {
        split: false
    },
    yAxis: {
        opposite: false,
        labels: {
            style: {
                color: '#666'
            }
        },
        custom: {
            allowNegativeLog: true
        }
    },
    xAxis: {
        type: 'linear',
        labels: {
            style: {
                color: '#666'
            }
        },
        custom: {
            allowNegativeLog: true
        },
        crosshair: {
            color: '#727ea1'
        }
    },
    data: {
        csv: '',
        itemDelimiter: ';'
    },
    credits: {
        enabled: false, // enabled on export only
        position: {
            y: -2
        }
    }
};
