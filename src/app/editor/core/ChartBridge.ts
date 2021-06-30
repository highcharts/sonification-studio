import Highcharts from 'highcharts';
import { GenericObject, deepMerge } from './utils/objects';
import { downloadURI } from './utils/browserUtils';
import { getSeriesId } from './utils/chartUtils';
import { defaultChartOptions } from './defaultChartOptions';
import { getChartOptionsFromParameters } from './optionsMapper/chartOptionsMapper';
import { getSeriesOptionsFromParameters } from './optionsMapper/seriesOptionsMapper';
import { Store } from 'vuex';

interface UpdateProgressState {
    intervalTimer: number|null;
    prevTimestamp: number;
    prevEventStartTime: number;
}


/**
 * Interface between chart-specific logic and the rest of the
 * app.
 */
export class ChartBridge {

    // How often to trigger updates for parameter changes
    private static parameterReactivityIntervalMs = 300;
    // How often to trigger updates for data changes
    private static dataReactivityIntervalMs = 1000;
    // Playback progress bar update interval
    private static updateProgressIntervalMs = 15;

    private chart: GenericObject|null = null;
    private chartOptions: GenericObject = {};
    private chartParametersStore: GenericObject;
    private seriesParametersStore: GenericObject;
    private globalSonifyParametersStore: GenericObject;
    private getStoreParam: (storeId: string, param: string) => any;
    private commitToStore: (id: string, payload?: any) => void;
    private reactivityTimeouts: GenericObject = {};
    private updateProgressState: UpdateProgressState;
    private _seReactivityCounter: number|null = null;
    private audioSampleTimeline: GenericObject|null = null;


    /**
     * Construct the class with a Vuex store instance
     */
    constructor(store: Store<any>, private Highcharts: GenericObject) {
        this.updateProgressState = {
            intervalTimer: null,
            prevTimestamp: 0,
            prevEventStartTime: 0
        };
        this.chartParametersStore = store.state.chartParametersStore;
        this.seriesParametersStore = store.state.seriesParametersStore;
        this.globalSonifyParametersStore = store.state.globalSonifyParametersStore;
        this.commitToStore = (id: string, payload?: any) => store.commit(id, payload);
        this.getStoreParam = (storeId: string, param: string): any => store.state[storeId][param];

        store.subscribe(this.onStoreMutation.bind(this));
    }


    /**
     * Init the class with a chart
     */
    public init(chart: GenericObject): void {
        this.chart = chart;
        this.updateChartOptions();

        // Once we have a chart, we need to trigger reactivity again to force updates
        this.commitToStore('viewStore/triggerParameterReactivity');
        this.commitToStore('viewStore/triggerDataReactivity');
    }


    /**
     * Force chart to update sizing. Sometimes needed when the chart
     * container switches from being invisible to visible.
     */
    public reflowChart(): void {
        setTimeout(() => this.chart?.reflow(), 10);
    }


    /**
     * The purpose of this function is to create a dependency on a
     * reactive property (reactivityCounter) that can be changed elsewhere
     * in the code, and force updates of props that depend on chartBridge
     * functions.
     *
     * This is particularly useful for non-POD structures that contain
     * functions, as they can not be stored in a Vuex store. For example,
     * for components that depend on chart data series objects.
     *
     * Two reactivity counters are provided in the view store,
     * reactToDataUpdates, and reactToParameterUpdates. These are
     * incremented by the ChartBridge class when relevant updates are made.
     *
     * Example:
     *
     * Add a computed property "test" that is computed as follows:
     *      test: () => this.$chartBridge.reactiveGet(
     *              'getCurrentChartOptions', this.reactToParameterUpdates);
     *
     * Whenever "this.reactToParameterUpdates" is updated (e.g. incremented),
     * the value of "test" will update as well, and fetch its result from
     * "getCurrentChartOptions".
     */
    public reactiveGet(func: keyof ChartBridge, reactivityCounter: number, payload?: any): any {
        this._seReactivityCounter = reactivityCounter;

        const res = (this as any)[func](payload);

        if (typeof res === 'object' && res) {
            res._seReactivityCounter = this._seReactivityCounter;
        }

        return res;
    }


    /**
     * Builds the final options passed to the chart for rendering, based on
     * mapping parameters and CSV data.
     */
    public buildChartOptions(csv?: string) {
        // chartOptions contains the current state of the chart mapping parameters
        const chartSettings = this.chartOptions;
        // We hook into the legend item click event to link it with the series.visible option
        const legendItemClickHook = this.getLegendItemHookOptions();
        const defaultOptions = deepMerge(defaultChartOptions, legendItemClickHook);

        // Need to update the chart data first to know which (new) series to build options for.
        // Only once the CSV has been parsed can we build the series options. This is why
        // series options are built separately.
        const newOptions = Object.assign({
            data: {
                csv: csv || 'null',

                complete: (parseResult: GenericObject) => {
                    const chart = this.chart;

                    if (chart) {
                        // Get ids of series parsed
                        const seriesIds = (parseResult.series || []).map((s: GenericObject, ix: number) => {
                            s.index = ix;
                            const id = getSeriesId(s);

                            delete s.index;
                            return id;
                        });

                        // Extend parsed results with series options
                        const seriesOptions = this.buildSeriesOptions(seriesIds);
                        if (seriesOptions) {
                            parseResult.series = deepMerge(parseResult.series, seriesOptions);
                            this.handleGroupOnlySeries(parseResult.series);
                        }
                    }
                }
            }
        }, chartSettings);

        return deepMerge(defaultOptions, newOptions);
    }


    public getDataSeries(): Array<GenericObject> {
        return this.chart?.series || [];
    }


    public isPaused(): boolean {
        const timeline = this.chart?.sonification.timeline;
        return timeline && timeline.paths.length && !timeline.atStart();
    }


    public playChart(onEnd?: (e: any) => void) {
        const chart = this.chart;
        if (!chart || !chart.series?.length || this.isPlaying()) {
            return;
        }

        this.startProgressUpdatePolling();

        if (!this.isPaused()) {
            chart.sonify({
                onEnd: (e: any) => {
                    this.stopChart();
                    if (onEnd) {
                        onEnd(e);
                    }
                }
            });
        } else {
            chart.resumeSonify();
        }
    }


    public stopChart() {
        this.stopProgressUpdatePolling();
        this.chart?.cancelSonify();
        this.updatePlayProgress();
    }


    public pauseChart() {
        this.stopProgressUpdatePolling();
        this.chart?.pauseSonify();
    }


    public loopChart() {
        this.playChart((e: GenericObject) => {
            if (!e.cancelled) {
                this.loopChart();
            }
        });
    }


    public playAudioSample(instrument: string) {
        const globalVolume = this.getStoreParam('globalSonifyParametersStore', 'volume');
        const sonificationLib = (Highcharts as any).sonification;
        const getEarconForFreq = (freq: number) =>
            (new sonificationLib.Earcon({
                instruments: [{
                    instrument: instrument,
                    playOptions: {
                        frequency: freq,
                        volume: 0.7 * globalVolume / 100,
                        duration: 150
                    }
                }]
            }));

        const makeTimelineEvent = (frequency: number, time: number) => (
            new sonificationLib.TimelineEvent({
                eventObject: getEarconForFreq(frequency),
                time: time
            }));

        const timelinePath = new sonificationLib.TimelinePath({
            events: [
                makeTimelineEvent(523, 0),
                makeTimelineEvent(784, 160),
                makeTimelineEvent(1047, 320),
                makeTimelineEvent(1568, 480)
            ]
        });

        let timeline = this.audioSampleTimeline;
        if (timeline) {
            timeline.pause();
        }
        timeline = this.audioSampleTimeline = new sonificationLib.Timeline({
            paths: [timelinePath],
            onEnd() {
                if (timeline) {
                    timeline.pause();
                    timeline.resetCursor();
                }
            }
        }) as GenericObject;
        timeline.play();
    }


    public downloadPNG(): void {
        if (this.chart) {
            this.chart.exportChart({
                filename: this.getChartTitleForExport()
            });
        }
    }


    public downloadSVG(): void {
        if (this.chart) {
            this.chart.exportChart({
                type: 'image/svg+xml',
                filename: this.getChartTitleForExport()
            });
        }
    }


    public getChartTitleForExport(): string {
        const title: string = this.chart?.options.title.text;
        const filteredTitle = title.split('').filter(c => /[\w- ]/.test(c)).join('');
        return filteredTitle || 'export';
    }


    public downloadChartConfig(): void {
        const options = this.getChartOptionsForExport();
        const json = JSON.stringify(options, void 0, 2);
        const blob = new Blob([json], {type: 'text/json'});
        const uri = window.URL.createObjectURL(blob);
        const filename = this.getChartTitleForExport() + '.json';
        downloadURI(uri, filename);
    }


    public downloadAudio(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.browserSupportsRecording()) {
                reject(new Error('Browser does not support media recording. Audio could not be downloaded.'));
            }
            if (!this.chart) {
                reject(new Error('Could not download audio, no chart defined.'));
            }

            const context: AudioContext = this.Highcharts.audioContext;
            const destination = context.createMediaStreamDestination();
            this.setAudioDestinationNode(destination);

            const recorder = this.recordStream(destination.stream, true, resolve, reject);

            this.playChart(() => {
                this.setAudioDestinationNode();
                recorder.stop();
            });
        });
    }


    public downloadVideo(framerate: number): Promise<void> {
        if (!this.browserSupportsRecording()) {
            throw new Error('Browser does not support media recording. Video could not be downloaded.');
        }

        const canvas = document.createElement('canvas');
        const chartEl: HTMLElement|undefined = this.chart?.renderer?.box;
        if (!chartEl) {
            throw new Error('downloadVideo: Could not find chart.');
        }
        // Safari needs the canvas width/height to get resolution for video stream.
        canvas.width = chartEl.offsetWidth;
        canvas.height = chartEl.offsetHeight;

        // eslint-disable-next-line
        const unusedCtx = canvas.getContext('2d'); // Because of bug in firefox, must get context before capt.stream.
        const canvasStream = (canvas as any).captureStream(framerate);
        if (!canvasStream) {
            console.log('Canvas context:', unusedCtx); // Use context so it is not optimized away.
            throw new Error('Canvas capture stream not supported.');
        }
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (!videoTrack) {
            throw new Error('Could not get canvas video track.');
        }

        const audioContext: AudioContext = this.Highcharts.audioContext;
        const audioDestination = audioContext.createMediaStreamDestination();
        const exportStream = audioDestination.stream;
        exportStream.addTrack(videoTrack);
        this.setAudioDestinationNode(audioDestination);

        return new Promise((resolve, reject) => {
            const recorder = this.recordStream(exportStream, false, void 0, reject);
            const chartPainter = setInterval(() => {
                this.drawChartOnCanvas(canvas).catch((e) => {
                    clearInterval(chartPainter);
                    recorder.stop();
                    this.setAudioDestinationNode();
                    reject(e);
                });
            }, 1000 / framerate);

            this.playChart(() => {
                recorder.stop();
                this.setAudioDestinationNode();
                clearInterval(chartPainter);
                resolve();
            });
        });
    }


    private recordStream(
        stream: MediaStream,
        audioOnly: boolean,
        onEnd?: () => void,
        onError?: (e: { error: DOMException }) => void
    ): GenericObject {
        const recorder = this.getMediaRecorder(stream, audioOnly);
        const data: any = [];
        recorder.ondataavailable = (e: GenericObject) => {
            data.push(e.data);
        };
        recorder.onstop = () => {
            const blob = new Blob(data, { 'type' : recorder.mimeType });
            const url = URL.createObjectURL(blob);
            const filename = this.getChartTitleForExport() + '.'
                + this.getFileExtensionFromMimeType(recorder.mimeType);
            downloadURI(url, filename);
            onEnd?.();
        };
        recorder.onerror = onError;

        recorder.start();
        return recorder;
    }


    private drawChartOnCanvas(canvas: HTMLCanvasElement): Promise<void> {
        return new Promise((resolve, reject) => {
            const svg = this.chart?.renderer?.box.outerHTML;
            if (!svg) {
                reject('No chart to render from.');
            }
            const win = window;
            const img = new win.Image();
            const imgURL = (win.URL || win.webkitURL || win).createObjectURL(new win.Blob([svg], {
                type: 'image/svg+xml'
            }));
            const ctx = canvas.getContext && canvas.getContext('2d');

            img.onload = () => {
                if (ctx) {
                    canvas.height = img.height * 2;
                    canvas.width = img.width * 2;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                } else {
                    reject('Failed to obtain canvas drawing context.');
                }
            };

            img.onerror = () => reject('Failed to load chart SVG into image object.');
            img.src = imgURL;
        });
    }


    private getChartOptionsForExport(): GenericObject {
        const userOptions = deepMerge(this.chart?.userOptions, {});
        if (userOptions) {
            delete userOptions.data;
            delete userOptions._seReactivityCounter;
            delete userOptions.plotOptions?.series?.events;
            return userOptions;
        }
        return {};
    }


    private getMediaRecorder(stream: MediaStream, audioOnly = true): GenericObject {
        const Recorder = (window as any).MediaRecorder;
        const preferredMimeTypes = audioOnly ? [
            'audio/wav',
            'audio/mpeg',
            'audio/mp4',
            'audio/ogg',
            'audio/x-aiff',
            'audio/webm',
        ] : [
            'video/mp4',
            'video/webm'
        ];
        const mimeType = preferredMimeTypes.find((type) => Recorder.isTypeSupported(type));
        if (!mimeType) {
            throw new Error('Media recording not supported by browser, no supported file format.');
        }
        return new Recorder(stream, {
            mimeType
        });
    }


    private getFileExtensionFromMimeType(mimeType: string): string {
        const mapping: GenericObject = {
            'audio/mpeg': 'mp3',
            'audio/wav': 'wav',
            'audio/ogg': 'ogg',
            'audio/mp4': 'mp4',
            'audio/x-aiff': 'aiff',
            'audio/webm': 'webm',
            'video/mp4': 'mp4',
            'video/webm': 'webm'
        };
        const extension = Object.keys(mapping).find((key) => mimeType.indexOf(key) > -1);
        if (!extension) {
            throw new Error('Unknown mime type ' + mimeType);
        }
        return mapping[extension];
    }


    private browserSupportsRecording(): boolean {
        return !!(window as any).MediaRecorder;
    }


    private setAudioDestinationNode(node?: AudioNode) {
        this.Highcharts.sonification.Instrument.prototype.destinationNode = node ||
            this.Highcharts.audioContext.destination;
    }


    private getLegendItemHookOptions(): GenericObject {
        const chartBridge = this;
        return {
            plotOptions: {
                series: {
                    events: {
                        legendItemClick: function () {
                            const series: GenericObject = this;
                            chartBridge.commitToStore('seriesParametersStore/setSeriesParameter', {
                                seriesId: getSeriesId(series),
                                parameterName: 'seriesVisible',
                                parameterValue: !series.visible
                            });
                        }
                    }
                }
            }
        };
    }


    private isPlaying(): boolean {
        return !!Object.keys(this.chart?.sonification?.timeline?.pathsPlaying || {}).length;
    }


    private onStoreMutation(mutation: GenericObject) {
        const chartIsValid = this.chart && this.chart.options;
        if (chartIsValid && this.isParameterMutation(mutation)) {
            this.queueReactivityUpdate(
                'viewStore/triggerParameterReactivity',
                ChartBridge.parameterReactivityIntervalMs,
                'paramReactivityTimeout',
                () => this.updateChartOptions()
            );
        } else if (chartIsValid && this.isDataMutation(mutation)) {
            this.queueReactivityUpdate(
                'viewStore/triggerDataReactivity',
                ChartBridge.dataReactivityIntervalMs,
                'dataReactivityTimeout'
            );
        }
    }


    private isParameterMutation(mutation: GenericObject): boolean {
        return mutation.type.startsWith('chartParameters') ||
            mutation.type.startsWith('seriesParameters') ||
            mutation.type.startsWith('globalSonifyParameters');
    }


    private isDataMutation(mutation: GenericObject): boolean {
        return mutation.type.startsWith('dataStore');
    }


    // Trigger a reactivity update, but only once every X milliseconds.
    private queueReactivityUpdate(
        mutation: string, interval: number, timeoutId: string, beforeTrigger?: Function
    ) {
        const timeouts = this.reactivityTimeouts;
        if (!timeouts[timeoutId]) {
            timeouts[timeoutId] = setTimeout(() => {
                delete timeouts[timeoutId];
                if (beforeTrigger) {
                    beforeTrigger();
                }
                this.commitToStore(mutation);
            }, interval);
        }
    }


    // Chart options are cached for performance, only updated on reactivity trigger
    private updateChartOptions() {
        // Chart invalid after project file load, component is hidden.
        const chartIsValid = this.chart && this.chart.options;
        if (chartIsValid) {
            this.chartOptions = getChartOptionsFromParameters(
                this.globalSonifyParametersStore,
                this.chartParametersStore,
                this.chart || {}
            );
        }
    }


    private buildSeriesOptions(seriesIds: string[]): GenericObject[]|null {
        if (this.chart) {
            return getSeriesOptionsFromParameters(
                this.seriesParametersStore.seriesParameters,
                seriesIds
            );
        }
        return null;
    }


    // Workaround until Highcharts puts a role on series that have too many data points to be exposed individually.
    private handleGroupOnlySeries(series: Array<GenericObject>): void {
        const threshold: number = this.chart?.options.accessibility.series.pointDescriptionEnabledThreshold || 200;
        series.forEach(seriesOpts => {
            const data = seriesOpts.data;
            if (data.length > threshold) {
                seriesOpts.accessibility = seriesOpts.accessibility || {};
                seriesOpts.accessibility.exposeAsGroupOnly = true;
            }
        });
    }


    private startProgressUpdatePolling() {
        const progressState = this.updateProgressState;

        this.stopProgressUpdatePolling();

        progressState.prevEventStartTime = Date.now();
        progressState.prevTimestamp = 0;
        progressState.intervalTimer = setInterval(
            this.updatePlayProgress.bind(this), ChartBridge.updateProgressIntervalMs
        );
    }


    private stopProgressUpdatePolling() {
        const progressState = this.updateProgressState;
        progressState.prevEventStartTime = Date.now();
        progressState.prevTimestamp = 0;
        if (progressState.intervalTimer) {
            clearInterval(progressState.intervalTimer);
        }
    }


    private updatePlayProgress() {
        const progressPct = this.getCurrentPlayProgressPct();
        this.commitToStore('viewStore/setPlaybackProgress', progressPct);
    }


    private getTimelineCurrentEventTime(timeline: GenericObject): number {
        const curEvents: Array<GenericObject> = Object.values(timeline.getCursor());
        return curEvents.reduce((maxTime, event): number => {
            return Math.max(maxTime, event.time);
        }, 0);
    }


    // Utility function to get the current timestamp of the event playing on a timeline,
    // plus the expected duration of all previous paths.
    private getTimelineTotalCursorMs(timeline: GenericObject): number {
        const curEventTimestamp = this.getTimelineCurrentEventTime(timeline);
        const splat = (x: any): any[] => {
            const str = Object.prototype.toString.call(x);
            const isArray = str === '[object Array]' || str === '[object Array Iterator]';
            return isArray ? x : [x];
        };

        let i = timeline.cursor;
        let previousTime = 0;
        if (i > 0) {
            while (i--) {
                const paths = splat(timeline.paths[i]) || [];
                const maxPathDuration = paths.reduce((maxDuration, path) => {
                    return Math.max(maxDuration, path.targetDuration || 0);
                }, 0);

                previousTime += maxPathDuration;
            }
        }

        return previousTime + curEventTimestamp;
    }


    // Get next timeline event timestamp relative to current event, in milliseconds
    private getNextTimelineTimestamp(timeline: GenericObject): number {
        const curPaths = timeline.getCurrentPlayingPaths();
        const curEventTime = this.getTimelineCurrentEventTime(timeline);

        const pathTimes: number[] = curPaths.reduce((times: number[], path: GenericObject): number[] => {
            return times.concat(path.events.map((ev: GenericObject): number => ev.time));
        }, []);
        const pathTimesLarger = pathTimes.filter(x => x > curEventTime);
        if (pathTimesLarger.length) {
            return Math.min(...pathTimesLarger) - curEventTime;
        }

        const targetDuration = curPaths.reduce((maxDuration: number, path: GenericObject) => {
            return Math.max(maxDuration, path.targetDuration || 0);
        }, 0);
        return targetDuration - curEventTime;
    }


    // Utility to get interpolated progress between two event times based on actual time elapsed.
    private getInterpolatedPlayProgress(
        prevTime: number,
        nextTime: number,
        prevEventStartTime: number
    ): number {
        const now = Date.now();
        const diff = now - prevEventStartTime;
        const slowdownModifier = 0.9; // Compensate some for the time it takes for the browser to play things
        const offset = diff * slowdownModifier;
        return Math.min(offset, nextTime - prevTime);
    }


    private getCurrentPlayProgressPct(): number {
        const sonification = this.chart?.sonification;
        const timeline = sonification?.timeline;
        const progressState = this.updateProgressState;
        const now = Date.now();

        if (!timeline || !timeline.paths.length) {
            return 0;
        }

        const curTime = this.getTimelineTotalCursorMs(timeline);
        const prevTime = progressState.prevTimestamp;
        const totalDuration = sonification.duration;

        let interpolationOffset = 0;
        if (curTime === prevTime) {
            const nextTimeRelative = this.getNextTimelineTimestamp(timeline);
            const nextTime = nextTimeRelative ? nextTimeRelative + prevTime : totalDuration;
            interpolationOffset = this.getInterpolatedPlayProgress(
                prevTime, nextTime, progressState.prevEventStartTime
            );
        } else {
            progressState.prevEventStartTime = now;
        }

        progressState.prevTimestamp = curTime;

        return Math.round((curTime + interpolationOffset) / totalDuration * 100);
    }
}
