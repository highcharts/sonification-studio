import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import type Announcer from './utils/Announcer';
import { GenericObject, deepMerge } from './utils/objects';
import { downloadURI } from './utils/browserUtils';
import { getSeriesId } from './utils/chartUtils';
import { defaultChartOptions } from './defaultChartOptions';
import { getChartOptionsFromParameters } from './optionsMapper/chartOptionsMapper';
import { getSeriesOptionsFromParameters } from './optionsMapper/seriesOptionsMapper';
import { GoogleSheetStatus } from '../store/modules/data';
import { Store } from 'vuex';


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
    private announcer: Announcer|null = null;
    private chartOptions: GenericObject = {};
    private chartDataOptions: GenericObject = {};
    private chartParametersStore: GenericObject;
    private seriesParametersStore: GenericObject;
    private globalSonifyParametersStore: GenericObject;
    private getStoreParam: (storeId: string, param: string) => any;
    private commitToStore: (id: string, payload?: any) => void;
    private storeGetter: (storeId: string, getterId: string) => any;
    private reactivityTimeouts: GenericObject = {};
    private progressTimer: number|undefined;
    private _seReactivityCounter: number|null = null;
    private audioSampleTimeline: GenericObject|null = null;


    /**
     * Construct the class with a Vuex store instance
     */
    constructor(store: Store<any>, private Highcharts: GenericObject) {
        this.chartParametersStore = store.state.chartParametersStore;
        this.seriesParametersStore = store.state.seriesParametersStore;
        this.globalSonifyParametersStore = store.state.globalSonifyParametersStore;
        this.commitToStore = (id: string, payload?: any) => store.commit(id, payload);
        this.getStoreParam = (storeId: string, param: string): any => store.state[storeId][param];
        this.storeGetter = (storeId: string, getterId: string): any => store.getters[`${storeId}/${getterId}`];

        store.subscribe(this.onStoreMutation.bind(this));
    }


    /**
     * Init the class with a chart
     */
    public init(chart: GenericObject): void {
        this.chart = chart;

        // Once we have a chart, we need to trigger reactivity to get the first update
        this.forceUpdate();
    }


    public initAnnouncer(announcer: Announcer): void {
        this.announcer = announcer;
    }


    /**
     * Use this function to force chart option updates - mostly useful if altering deep
     * sub properties in store that are not picked up by the automatic watcher.
     */
    public forceUpdate(queued = false): void {
        if (!queued) {
            this.updateChartOptions();
            this.commitToStore('viewStore/triggerParameterReactivity');
            this.commitToStore('viewStore/triggerDataReactivity');
        } else {
            this.queueNewParamReactivity();
            this.queueNewDataReactivity();
        }
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

        const dataSource = this.getStoreParam('dataStore', 'selectedDataSource');
        const spreadsheetSetupComplete = this.getStoreParam('dataStore', 'spreadsheetSetupComplete');

        const dataSourceOptions = dataSource === 'googlesheets' && spreadsheetSetupComplete ? {
            csv: void 0,
            firstRowAsNames: true,
            googleAPIKey: this.getStoreParam('dataStore', 'googleApiKey'),
            googleSpreadsheetKey: this.storeGetter('dataStore', 'googleSpreadsheetId'),
            enablePolling: this.getStoreParam('dataStore', 'googleAutoUpdateEnabled'),
            dataRefreshRate: this.getStoreParam('dataStore', 'googleAutoUpdateEnabled'),
            error: (text: string) => {
                const errObj = JSON.parse(text);
                const message = errObj?.error?.message || 'Unknown error';
                this.commitToStore('dataStore/setGoogleSheetErrorMessage', message);
                this.commitToStore('dataStore/setGoogleSheetStatus', GoogleSheetStatus.Error);
            }
        } : {
            csv: csv || 'null',
            columns: null,
            firstRowAsNames: true,
            googleSpreadsheetKey: '',
            enablePolling: false
        };

        const dataOptions = {
            data: Object.assign(dataSourceOptions, {
                complete: (parseResult: GenericObject) => {
                    if (dataSource === 'googlesheets' && spreadsheetSetupComplete) {
                        this.commitToStore('dataStore/setGoogleSheetStatus', GoogleSheetStatus.Success);
                    }

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
                        this.chartDataOptions = parseResult;
                    }
                }
            })
        };

        // Need to update the chart data first to know which (new) series to build options for.
        // Only once the CSV has been parsed can we build the series options. This is why
        // series options are built separately.
        const newOptions = Object.assign(dataOptions, chartSettings);

        return deepMerge(defaultOptions, newOptions);
    }


    public getDataSeries(): Array<GenericObject> {
        return this.chart?.series || [];
    }


    public isPaused(): boolean {
        return this.chart?.sonification.timeline?.isPaused;
    }


    public playChart(onEnd?: (e: any) => void) {
        const chart = this.chart;
        if (!chart || !chart.series?.length || this.isPlaying()) {
            return;
        }

        this.startProgressUpdatePolling();

        if (!this.isPaused()) {
            chart.sonify((e: any) => {
                if (onEnd) {
                    onEnd(e);
                }
            });
        } else {
            chart.sonification.timeline.resume();
        }
    }


    public stopChart() {
        this.stopProgressUpdatePolling();
        this.chart?.sonification.timeline?.reset();
        this.updatePlayProgress();
    }


    public pauseChart() {
        this.stopProgressUpdatePolling();
        this.chart?.sonification.timeline.pause();
    }


    public loopChart() {
        this.playChart(() => this.loopChart());
    }


    public playNext() {
        this.stopProgressUpdatePolling();
        this.chart?.sonification.timeline.pause();
    }


    public playAdjacent(next: boolean) {
        this.chart?.sonification.timeline.playAdjacent(next, (_: unknown, pointsPlayed: GenericObject[]): void => {
            const numSeries = this.chart?.series.length;
            const announcement = pointsPlayed.reduce((acc, cur): string => {
                const val = numSeries > 1 ? cur.y + ' ' + cur.series.name : cur.y;
                return acc ? acc + ', ' + val : val;
            }, '') + '. X is ' + pointsPlayed[0].x;

            if (this.announcer) {
                this.announcer.announce(announcement, true);
            }
        });
        this.updatePlayProgress();
    }


    public playAudioSample(instrument: string) {
        const globalVolume = this.getStoreParam('globalSonifyParametersStore', 'volume');
        const Instrument = this.Highcharts.sonification.SonificationInstrument,
            Timeline = this.Highcharts.sonification.SonificationTimeline,
            s = this.chart?.sonification;

        if (!s) {
            return;
        }

        let timeline = this.audioSampleTimeline;
        if (timeline) {
            timeline.destroy();
        }
        timeline = this.audioSampleTimeline = new Timeline() as GenericObject;

        const instr = new Instrument(s.audioContext, s.audioContext.destination, {
            synthPatch: instrument
        });

        timeline.addChannel('instrument', instr, [{
            time: 0,
            instrumentEventOptions: {
                note: 'c3',
                noteDuration: 150,
                volume: globalVolume / 100
            }
        },
        { time: 150, instrumentEventOptions: { note: 'g3' } },
        { time: 300, instrumentEventOptions: { note: 'c4' } },
        { time: 450, instrumentEventOptions: { note: 'c5' } },
        { time: 600, instrumentEventOptions: { note: 'g5' } }]);

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


    public downloadMIDI(): void {
        if (this.chart?.sonification.timeline) {
            this.chart.sonification.timeline.downloadMIDI(
                this.getChartTitleForExport());
        } else {
            alert('Chart not created yet.');
        }
    }


    public getChartTitleForExport(): string {
        const title: string = this.chart?.options.title.text;
        const filteredTitle = title.split('').filter(c => /[\w- ]/.test(c)).join('');
        return filteredTitle || 'export';
    }


    public getAvailableInstruments(): Array<Record<'name'|'value', string>> {
        return Object.keys(
            this.Highcharts.sonification.InstrumentPresets
        ).map(i => ({
            name: i[0].toUpperCase() + i.slice(1),
            value: i
        }));
    }


    public getMinMaxValuesForProp(prop: string): Record<'min'|'max', number> {
        if (!this.chart) {
            return { min: 0, max: 100 };
        }
        // Todo: Expose the caches in Highcharts to grab from there later.
        const axis = prop === 'x' ? this.chart.xAxis[0] : this.chart.yAxis[0];
        return {
            min: axis.dataMin,
            max: axis.dataMax
        };
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
            if (!this.chart?.sonification) {
                reject(new Error('Could not download audio, no chart defined.'));
            }

            const context: AudioContext = this.chart?.sonification.audioContext;
            const destination = context.createMediaStreamDestination();
            this.setAudioDestinationNode(destination);

            const recorder = this.recordStream(destination.stream, true, resolve, reject);

            setTimeout(() =>
                this.playChart(() => setTimeout(() => {
                    recorder.stop();
                    this.setAudioDestinationNode();
                }, 300)), 300);
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

        const audioContext: AudioContext = this.chart?.sonification.audioContext;
        const audioDestination = audioContext.createMediaStreamDestination();
        const exportStream = audioDestination.stream;
        exportStream.addTrack(videoTrack);
        this.setAudioDestinationNode(audioDestination);

        // Add credits before exporting
        this.chart?.update({
            credits: { enabled: true }
        });

        return new Promise((resolve, reject) => setTimeout(() => {
            const recorder = this.recordStream(exportStream, false, void 0, reject);
            const chartPainter = setInterval(() => {
                this.drawChartOnCanvas(canvas).catch((e) => {
                    clearInterval(chartPainter);
                    recorder.stop();
                    this.setAudioDestinationNode();
                    reject(e);
                });
            }, 1000 / framerate);

            this.playChart(() => setTimeout(() => {
                recorder.stop();
                this.setAudioDestinationNode();
                clearInterval(chartPainter);

                // Remove credits again after export
                this.chart?.update({
                    credits: { enabled: false }
                });

                resolve();
            }, 200));
        }, 200));
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

            const mergedOptions = deepMerge(userOptions, this.chartOptions);
            if (this.chartDataOptions?.series) {
                mergedOptions.series = this.chartDataOptions.series;
            }

            delete mergedOptions.yAxis['0'];
            delete mergedOptions.xAxis['0'];
            delete mergedOptions.isStock;
            delete mergedOptions.sonification?.events;
            return mergedOptions;
        }
        return {};
    }


    private getMediaRecorder(stream: MediaStream, audioOnly = true): GenericObject {
        const Recorder = (window as any).MediaRecorder;
        const preferredMimeTypes = audioOnly ? [
            'audio/wav',
            'audio/mpeg',
            'audio/mp3',
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
            'audio/mp3': 'mp3',
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
        this.chart?.sonification.setAudioDestination(node ||
            this.chart.sonification.audioContext.destination);
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
        return this.chart?.sonification.isPlaying();
    }


    private onStoreMutation(mutation: GenericObject) {
        const chartIsValid = this.chart && this.chart.options;
        if (chartIsValid && this.isParameterMutation(mutation)) {
            this.queueNewParamReactivity();
        } else if (chartIsValid && this.isDataMutation(mutation)) {
            this.queueNewDataReactivity();
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


    private queueNewParamReactivity() {
        this.queueReactivityUpdate(
            'viewStore/triggerParameterReactivity',
            ChartBridge.parameterReactivityIntervalMs,
            'paramReactivityTimeout',
            () => this.updateChartOptions()
        );
    }


    private queueNewDataReactivity() {
        this.queueReactivityUpdate(
            'viewStore/triggerDataReactivity',
            ChartBridge.dataReactivityIntervalMs,
            'dataReactivityTimeout'
        );
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
        const opts = this.chart?.options || Highcharts.getOptions();
        const threshold: number = opts?.accessibility.series.pointDescriptionEnabledThreshold || 200;
        series.forEach(seriesOpts => {
            const data = seriesOpts.data;
            if (data.length > threshold) {
                seriesOpts.accessibility = seriesOpts.accessibility || {};
                seriesOpts.accessibility.exposeAsGroupOnly = true;
            }
        });
    }


    private startProgressUpdatePolling() {
        this.stopProgressUpdatePolling();
        this.progressTimer = setInterval(
            this.updatePlayProgress.bind(this), ChartBridge.updateProgressIntervalMs
        );
    }


    private stopProgressUpdatePolling() {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }
    }


    private updatePlayProgress() {
        const chart = this.chart;
        if (!chart) {
            return 0;
        }
        const totalDuration = chart.options.sonification.duration || 1,
            curTime = chart.sonification.timeline?.getCurrentTime() || 0,
            progressPct = Math.round(100 * curTime / totalDuration);
        this.commitToStore('viewStore/setPlaybackProgress', progressPct);
    }
}
