import { GenericObject } from '../utils/objects';

export class GlobalSonificationMappings {

    public static volume(value: number): GenericObject {
        return {
            sonification: {
                masterVolume: value / 100
            }
        };
    }

    public static playbackOpts(value: { speed: number; order: string }, chart: GenericObject): GenericObject {
        const speed = value.speed;
        const maxDuration = 10000;
        const minDuration = 200;
        const slope = 6;
        const durationBase = (maxDuration - minDuration) / Math.max(1, speed / slope) + minDuration;
        const numSeries = chart.series.length;
        const order = value.order;
        const durationModifier = order === 'sequential' ? numSeries : 1;
        const afterSeriesWait = chart.options.sonification.afterSeriesWait;
        const waitTime = (durationModifier - 1) * afterSeriesWait;
        const duration = durationBase * durationModifier + waitTime;

        return {
            sonification: { duration, order }
        };
    }

    public static playMarkerEnabled(value: boolean): GenericObject {
        const highlightPoint = (e: any, point: GenericObject) => {
            const chart = point.series.chart;
            const hasVisibleSeries = chart.series.some(
                (series: GenericObject): boolean => series.visible
            );

            if (!point.isNull && hasVisibleSeries) {
                point.onMouseOver();
            } else {
                if (chart.tooltip) {
                    chart.tooltip.hide(0);
                }
            }
        };

        return {
            sonification: {
                events: {
                    onPointStart: value ? highlightPoint : null
                }
            }
        };
    }

    public static minFrequency(value: number): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    minFrequency: value
                }
            }
        };
    }

    public static maxFrequency(value: number): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    maxFrequency: value
                }
            }
        };
    }

    public static panEnabled(value: boolean): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    mapping: {
                        pan: value ? 'x' : 0
                    }
                }
            }
        };
    }

    public static panWidth(value: number): GenericObject {
        return {
            sonification: {
                defaultInstrumentOptions: {
                    minPan: 0 - value / 100,
                    maxPan: 0 + value / 100
                }
            }
        };
    }
}
