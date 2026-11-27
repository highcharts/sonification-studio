import type * as HighchartsModule from 'highcharts';
import type Announcer from './utils/Announcer';
import { type GenericObject, deepMerge } from './utils/objects';
import { downloadURI } from './utils/browserUtils';
import {
    escapePointNames,
    getGoogleSheetsErrorMessage,
    getSeriesId,
    removeNonNumericYValues,
    seriesDataHasValues
} from './utils/chartUtils';
import { escapeHTML, unescapeHTML } from './utils/htmlText';
import { getGridColumnIds, getSeriesColumnIds } from './utils/gridData';
import { defaultChartOptions } from './defaultChartOptions';
import { getChartOptionsFromParameters } from './optionsMapper/chartOptionsMapper';
import { getSeriesOptionsFromParameters } from './optionsMapper/seriesOptionsMapper';
import type { Pinia } from 'pinia';
import { useChartParametersStore } from '../store/modules/chartParameters';
import { useSeriesParametersStore } from '../store/modules/seriesParameters';
import { GoogleSheetStatus, useDataStore } from '../store/modules/data';
import { useGlobalSonifyParametersStore } from '../store/modules/globalSonifyParameters';
import { useViewStore } from '../store/modules/view';

// Where exported HTML files load Highcharts from: the highcharts npm package on
// jsDelivr, at the latest release of the major version the app uses, so that a
// later major, which may rename or remove the modules and theme they load (as
// 13 renamed high-contrast-light to high-contrast), does not break them. Not
// code.highcharts.com, which refuses requests without a Referer: browsers send
// none from a page opened from disk, which is how exported files are mostly
// opened. Bump it with the highcharts dependency, after checking that the
// script URLs in getHTMLChartConfig still exist.
export const highchartsExportCDN = 'https://cdn.jsdelivr.net/npm/highcharts@13';

// The event Highcharts.error() fires on the Highcharts object
interface HighchartsErrorEvent {
    chart?: HighchartsModule.Chart;
    message: string;
    preventDefault(): void;
}

// The sonification classes used to play instrument samples. Highcharts'
// declarations type SonificationInstrument as an instance rather than a class,
// and leave out SonificationTimeline, so they are described here.
interface SampleTimeline {
    addChannel(
        type: 'instrument',
        engine: object,
        showPlayMarker: boolean,
        events: HighchartsModule.SonificationTimelineEvent[]
    ): void;
    play(): void;
    destroy(): void;
}

interface SonificationSampleClasses {
    SonificationInstrument: new (
        audioContext: AudioContext,
        destination: AudioNode,
        options: { synthPatch: string }
    ) => object;
    SonificationTimeline: new () => SampleTimeline;
}

// The chart's sonification timeline, with the internals its own pause and
// resume use (Highcharts 13.1.1), which the playback handoff below uses too
export interface ChartTimeline {
    isPlaying: boolean;
    isPaused: boolean;
    resumeFromTime: number;
    channels: unknown[];
    playingChannels?: unknown[];
    onEndArgument?: (e: unknown) => void;
    getCurrentTime(): number;
    resume(): void;
}

// The bridge's methods, which reactiveGet calls by name, and their argument
type BridgeMethod = {
    [K in keyof ChartBridge]: ChartBridge[K] extends (...args: never[]) => unknown ? K : never
}[keyof ChartBridge];
type BridgeMethodArgument<K extends BridgeMethod> =
    ChartBridge[K] extends (argument: infer A, ...rest: never[]) => unknown ? A : never;
type BridgeMethodResult<K extends BridgeMethod> =
    ChartBridge[K] extends (...args: never[]) => infer R ? R : never;

// Where playback was when Highcharts last threw away the chart's timeline
interface PlaybackHandoff {
    playing: boolean;
    time: number;
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

    private chart: GenericObject | null = null;
    private announcer: Announcer | null = null;
    private chartOptions: GenericObject = {};
    private chartDataOptions: GenericObject = {};
    private chartParametersStore: ReturnType<typeof useChartParametersStore>;
    private seriesParametersStore: ReturnType<typeof useSeriesParametersStore>;
    private dataStore: ReturnType<typeof useDataStore>;
    private globalSonifyParametersStore: ReturnType<typeof useGlobalSonifyParametersStore>;
    private viewStore: ReturnType<typeof useViewStore>;
    private reactivityTimeouts: GenericObject = {};
    private progressTimer: number | undefined;
    private _seReactivityCounter: number | null = null;
    private audioSampleTimeline: SampleTimeline | null = null;
    // The callback the chart's timeline calls when playback ends, see playChart
    private playbackOnEnd: ((e: unknown) => void) | undefined;
    private playbackHandoff: PlaybackHandoff | null = null;
    // Called when the bridge stops playback itself, see onPlaybackStopped
    private playbackStoppedListeners = new Set<() => void>();
    // The series a Google Sheet gave last, see the data's complete handler
    private googleSheetData = '';

    /**
     * Construct the class with the app's Pinia instance and the app's
     * Highcharts instance (from highchartsSetup.ts).
     */
    constructor(pinia: Pinia, private Highcharts: typeof HighchartsModule) {
        this.chartParametersStore = useChartParametersStore(pinia);
        this.seriesParametersStore = useSeriesParametersStore(pinia);
        this.dataStore = useDataStore(pinia);
        this.globalSonifyParametersStore = useGlobalSonifyParametersStore(pinia);
        this.viewStore = useViewStore(pinia);

        this.subscribeToStoreActions();

        Highcharts.addEvent(Highcharts, 'displayError', (e: HighchartsErrorEvent) =>
            this.onHighchartsError(e)
        );
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
            this.viewStore.triggerParameterReactivity();
            this.viewStore.triggerDataReactivity();
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
     * functions, as they can not be stored in a Pinia store. For example,
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
    public reactiveGet<K extends BridgeMethod>(
        func: K,
        reactivityCounter: number,
        payload?: BridgeMethodArgument<K>
    ): BridgeMethodResult<K> {
        this._seReactivityCounter = reactivityCounter;

        const method = this[func] as (payload?: BridgeMethodArgument<K>) => BridgeMethodResult<K>;
        const res = method.call(this, payload);

        if (typeof res === 'object' && res) {
            (res as GenericObject)._seReactivityCounter = this._seReactivityCounter;
        }

        return res;
    }

    /**
     * Builds the final options passed to the chart for rendering, based on
     * mapping parameters and CSV data. The CSV is the data store's tableCSV:
     * its rows tell which of the grid's columns get a series.
     */
    public buildChartOptions(csv?: string) {
        // chartOptions contains the current state of the chart mapping parameters
        const chartSettings = this.chartOptions;
        // We hook into the legend item click event to link it with the series.visible option
        const defaultOptions = this.getDefaultOptions();

        const dataSource = this.dataStore.selectedDataSource;
        const spreadsheetSetupComplete = this.dataStore.spreadsheetSetupComplete;
        const fromGoogleSheets = dataSource === 'googlesheets' && spreadsheetSetupComplete;

        // The grid's columns that get a series; see the data's complete
        // handler below
        const seriesColumnIds = fromGoogleSheets ? null :
            getSeriesColumnIds(this.dataStore.tableRowData);

        /*eslint-disable indent */
        const dataSourceOptions =
            fromGoogleSheets
                ? {
                      csv: void 0,
                      firstRowAsNames: true,
                      googleAPIKey: this.dataStore.googleApiKey,
                      googleSpreadsheetKey: this.dataStore.googleSpreadsheetId,
                      enablePolling: this.dataStore.googleAutoUpdateEnabled,
                      dataRefreshRate: this.dataStore.googleAutoUpdateFrequency,
                      // Failed requests are handled in onHighchartsError
                  }
                : {
                      // A CSV of only line breaks (a cleared grid) must not
                      // reach the data module: it finds no columns and calls
                      // its afterComplete hook twice, so a chart created
                      // with it initializes twice and destroys itself.
                      csv: csv?.trim() ? csv : 'null',
                      columns: null,
                      firstRowAsNames: true,
                      googleSpreadsheetKey: '',
                      enablePolling: false,
                  };

        const dataOptions = {
            data: Object.assign(dataSourceOptions, {
                complete: (parseResult: GenericObject) => {
    // A polled sheet whose data has not changed is no news: the status
    // action would update the components that depend on the data, and
    // stop playback (PlayButtons) on every poll
    if (fromGoogleSheets) {
        const sheetData = JSON.stringify(
            (parseResult.series || []).map((s: GenericObject) => [s.name, s.data])
        );
        if (
            this.dataStore.googleSheetStatus !== GoogleSheetStatus.Success ||
            sheetData !== this.googleSheetData
        ) {
            this.googleSheetData = sheetData;
            this.dataStore.setGoogleSheetStatus(GoogleSheetStatus.Success);
        }
    }

    // Text in a column other than the first (e.g. a label column) can not
    // be plotted, and would make Highcharts throw. The series names (the
    // CSV headers) and the point names (text in the first column) are
    // escaped, so the chart shows them as text, not as HTML: in the
    // legend, the tooltip, the axis labels and the series labels.
    // Highcharts decodes them, also in its aria-labels (see
    // plainTextAriaLabelPlugin), and the editor reads them decoded.
    (parseResult.series || []).forEach((s: GenericObject) => {
        if (typeof s.name === 'string') {
            s.name = escapeHTML(s.name);
        }
        if (Array.isArray(s.data)) {
            s.data = escapePointNames(removeNonNumericYValues(s.data));
        }
    });

    // Leave out the series of the grid's columns that get none (see
    // getSeriesColumnIds): a column without cells, as master v1.1.1 did, and
    // the empty columns after the last value.
    if (seriesColumnIds && parseResult.series) {
        // Series i has the values of the CSV's column i + 1 (the first
        // column holds the x values)
        const columnIds = getGridColumnIds(parseResult.series.length + 1);
        parseResult.series = parseResult.series.filter(
            (_s: GenericObject, i: number) => seriesColumnIds.has(columnIds[i + 1])
        );
    }

    const chart = this.chart;

                    if (chart) {
                        // Get ids of series parsed
    const seriesIds = (parseResult.series || []).map(
        (s: GenericObject, ix: number) => {
            s.index = ix;
            const id = getSeriesId(s);

            delete s.index;
            return id;
        }
    );

                        // Extend parsed results with series options
    const seriesOptions = this.buildSeriesOptions(seriesIds);
    if (seriesOptions) {
        const mergedSeries = deepMerge(parseResult.series, seriesOptions);

        mergedSeries.forEach((s: GenericObject, i: number) => {
            const hasData = seriesDataHasValues(s.data);

            if (!s.name) {
                s.name = `Series ${i + 1}`;
            }

            // Only set defaults if user hasn't explicitly configured these settings
            if (s.visible === undefined) {
                s.visible = hasData;
            }
            if (s.showInLegend === undefined) {
                s.showInLegend = hasData;
            }
        });

        parseResult.series = mergedSeries;
                            this.handleGroupOnlySeries(parseResult.series);
    }

    this.chartDataOptions = parseResult;
}
                },
            }),
        };

        // Need to update the chart data first to know which (new) series to build options for.
        // Only once the CSV has been parsed can we build the series options. This is why
        // series options are built separately.
        const newOptions = Object.assign(dataOptions, chartSettings);

        return deepMerge(defaultOptions, newOptions);
    }

    /**
     * Options a chart can be created from whatever the user's data and
     * parameters are: the defaults, with the data of an empty grid. For when
     * Highcharts throws on the options from buildChartOptions while it
     * creates the chart. The chart has the data module set up, so it takes
     * the data of a later update.
     */
    public buildFallbackChartOptions(): GenericObject {
        // 'null' rather than '', as for an empty grid in buildChartOptions
        return deepMerge(this.getDefaultOptions(), { data: { csv: 'null' } });
    }

    // The default chart options, with the bridge's event hooks
    private getDefaultOptions(): GenericObject {
        return deepMerge(
            deepMerge(defaultChartOptions, this.getLegendItemHookOptions()),
            this.getTimelineUpdateHookOptions()
        );
    }

    public getDataSeries(): Array<GenericObject> {
        return this.chart?.series || [];
    }

    public isPaused(): boolean {
        return this.chart?.sonification?.timeline?.isPaused;
    }

    public playChart(onEnd?: (e: unknown) => void, loop = false) {
        const chart = this.chart;
        if (!chart || !chart.series?.length || this.isPlaying()) {
            return;
        }

        this.startProgressUpdatePolling();

        // With loop, each round plays the chart again with this same
        // callback, so that the next round ends the same way
        const onTimelineEnd = (e: unknown) => {
            if (onEnd) {
                onEnd(e);
            }
            if (loop && this.chart === chart) {
                chart.sonify(onTimelineEnd);
            } else {
                this.stopChart();
            }
        };
        this.playbackOnEnd = onTimelineEnd;
        // A paused timeline resumes with the callback it was given when it
        // started playing (or by continuePlayback), which may be another
        // playback's (e.g. with loop): give it this one
        const timeline: ChartTimeline | undefined = chart.sonification?.timeline;
        if (timeline?.isPaused) {
            timeline.onEndArgument = onTimelineEnd;
        }
        chart.toggleSonify(false, onTimelineEnd);
    }

    /**
     * Call a listener when the bridge stops playback itself (before an
     * audio or video export, which plays the chart from the start), so that
     * the play controls can show it. Returns a function that removes it.
     */
    public onPlaybackStopped(listener: () => void): () => void {
        this.playbackStoppedListeners.add(listener);
        return () => this.playbackStoppedListeners.delete(listener);
    }

    // Stop playback, playing or paused, so that an export plays the chart
    // from the start with its own end callback. Redirecting the audio rebuilds
    // the timeline, which would otherwise pick up where playback was.
    private stopPlaybackForExport(): void {
        const timeline: ChartTimeline | undefined = this.chart?.sonification?.timeline;
        const wasActive = !!timeline && (timeline.isPlaying || timeline.isPaused);
        this.stopChart();
        if (wasActive) {
            this.playbackStoppedListeners.forEach((listener) => listener());
        }
    }

    public stopChart() {
        this.stopProgressUpdatePolling();
        this.chart?.sonification?.timeline?.reset();
        this.playbackOnEnd = void 0;
        this.updatePlayProgress();
    }

    public pauseChart() {
        this.stopProgressUpdatePolling();
        this.chart?.sonification?.timeline?.pause();
    }

    public playNext() {
        this.stopProgressUpdatePolling();
        this.chart?.sonification?.timeline?.pause();
    }

    public playAdjacent(next: boolean) {
        this.chart?.sonification?.playAdjacent(next, (context: GenericObject): void => {
            const pointsPlayed: GenericObject[] = context.pointsPlayed;
            if (!pointsPlayed.length) {
                return;
            }
            const numSeries = this.chart?.series.length;
            const announcement =
                pointsPlayed.reduce((acc, cur): string => {
                    const val = numSeries > 1 ? cur.y + ' ' + unescapeHTML(cur.series.name) : cur.y;
                    return acc ? acc + ', ' + val : val;
                }, '') +
                '. X is ' +
                pointsPlayed[0].x;

            if (this.announcer) {
                this.announcer.announce(announcement, true);
            }
        });
        this.updatePlayProgress();
    }

    public playAudioSample(instrument: string) {
        const globalVolume = this.globalSonifyParametersStore.volume;
        const { SonificationInstrument: Instrument, SonificationTimeline: Timeline } = this
                .Highcharts.sonification as unknown as SonificationSampleClasses,
            s = this.chart?.sonification;

        if (!s) {
            return;
        }

        this.audioSampleTimeline?.destroy();
        const timeline = (this.audioSampleTimeline = new Timeline());

        const instr = new Instrument(s.audioContext, s.audioContext.destination, {
            synthPatch: instrument,
        });

        timeline.addChannel('instrument', instr, false, [
            {
                time: 0,
                instrumentEventOptions: {
                    note: 'c3',
                    noteDuration: 150,
                    volume: globalVolume / 100,
                },
            },
            { time: 150, instrumentEventOptions: { note: 'g3' } },
            { time: 300, instrumentEventOptions: { note: 'c4' } },
            { time: 450, instrumentEventOptions: { note: 'c5' } },
            { time: 600, instrumentEventOptions: { note: 'g5' } },
        ]);

        timeline.play();
    }

    // Highcharts 13 keeps chart.exportChart() only as a deprecated alias of
    // chart.exporting.exportChart()
    public downloadPNG(): void {
        this.chart?.exporting?.exportChart(
            {
                filename: this.getChartTitleForExport(),
            },
            {
                // Workaround for weird bug where xAxis somehow
                // becomes datetime on export
                xAxis: {
                    type: this.chart?.options?.xAxis?.type,
                },
            }
        );
    }

    public downloadSVG(): void {
        this.chart?.exporting?.exportChart(
            {
                type: 'image/svg+xml',
                filename: this.getChartTitleForExport(),
            },
            {
                // Workaround for weird bug where xAxis somehow
                // becomes datetime on export
                xAxis: {
                    type: this.chart?.options?.xAxis?.type,
                },
            }
        );
    }

    public downloadMIDI(): void {
        if (this.chart?.sonification.timeline) {
            this.chart.sonification.timeline.downloadMIDI(this.getChartTitleForExport());
        } else {
            alert('Chart not created yet.');
        }
    }

    public getChartTitleForExport(): string {
        const title: string = this.chart?.options?.title?.text;
        const filteredTitle = title
            ?.split('')
            ?.filter((c) => /[\w- ]/.test(c))
            ?.join('');
        return filteredTitle || 'export';
    }

    public getHTMLPlayControlsForChart(): string {
        return `
            <div class="playcontrols-inner-container">
                <div class="logo-wrapper">
                    <svg version="1.1" id="logo-highcharts" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="205" height="205" viewBox="0 0 205 205" xml:space="preserve" aria-hidden="true">
                        <g id="symbol" transform="translate(0,3.41400146484375) scale(3)">
                            <polygon fill="#8087E8" points="41.53900146484375,0 30.315000534057617,26.209999084472656 15.566999435424805,60.650997161865234 49.85900115966797,46.16499710083008 68.02299499511719,38.49300003051758 " id="svg_2" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                            <polygon fill="#30426B" points="47.25799560546875,31.729999542236328 49.86000061035156,46.16499710083008 68.02400207519531,38.49300003051758 " id="svg_3" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                            <polygon fill="#6699A1" points="41.53900146484375,0 47.25799560546875,31.730998992919922 68.02299499511719,38.49300003051758 " id="svg_4" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                            <polygon fill="#78758C" points="47.25799560546875,31.729999542236328 68.02400207519531,38.49300003051758 30.31599998474121,26.208999633789062 15.566999435424805,60.650997161865234 49.86000061035156,46.16499710083008 " id="svg_5" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                            <polygon fill="#A3EDBA" points="15.566999435424805,60.650997161865234 30.315000534057617,26.209999084472656 0,16.334999084472656 " id="svg_6" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                            <polygon fill="#6699A1" points="49.86000061035156,46.16499710083008 53.185997009277344,64.6099967956543 68.02400207519531,38.49300003051758 " id="svg_7" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                            <polygon fill="#8087E8" points="41.53900146484375,0 30.315000534057617,26.209999084472656 47.25799560546875,31.730998992919922 " id="svg_8" stroke-width="0" stroke="#383836" fill-opacity="1" stroke-linejoin="round"></polygon>
                        </g>
			        </svg>
                    <a href="https://sonification.highcharts.com/"><h1>Highcharts Sonification Studio</h1></a>
                </div>
                <div class="play-buttons-container playControlItem">
                    <h2 id="playcontrols-heading" class="sr-only">Play controls</h2>
                    <div class="play-button-wrap"></div>
                        <button id="play-button">
                            Play
                        </button>
                    <div class="reset-button-wrap"></div>
                        <button id="reset-button">
                            Reset
                        </button>
                </div>
            </div>
        `;
    }

    public getHTMLChartConfig(): string {
        const options = this.getChartOptionsForExport();
        // The options go into a <script> element. Text in them (a title, a
        // series name, a value) could end it with "</script>", so each "<"
        // is written as its Unicode escape (backslash, u003c), which
        // JavaScript reads back as "<" (in JSON, "<" can only be in a string).
        const optionsString = JSON.stringify(options, void 0, 2).replace(/</g, '\\u003c');
        const playControls = this.getHTMLPlayControlsForChart();
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.getChartTitleForExport()}</title>
                <script src="${highchartsExportCDN}/highcharts.js"></script>
                <script src="${highchartsExportCDN}/modules/accessibility.js"></script>
                <script src="${highchartsExportCDN}/modules/sonification.js"></script>
                <script src="${highchartsExportCDN}/themes/high-contrast.js"></script>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                    }
                    #logo-highcharts {
                        width: 1rem;
                        height: 1rem;
                    }
                    h1 {
                        font-size: .875rem;
                        font-weight: 400;
                        letter-spacing: .1em;
                        margin: 0 5px 0 5px;
                    }
                    a:focus, button:focus {
                        outline: 2px solid red;
                        outline-offset: 2px;
                    }
                    .sr-only {
                        position: absolute;
                        width: 1px;
                        height: 1px;
                        padding: 0;
                        margin: -1px;
                        overflow: hidden;
                        clip: rect(0,0,0,0);
                        border: 0;
        }
                    .playcontrols-inner-container {
                        max-width: 900px;
                        background-color: #ebeffa;
                        color: #25386f;
                        display: flex;
                        align-items: center;
                        padding: 5px;
                        box-sizing: border-box;
                    }
                    .playControlItem {
                        margin: 5px 8px;
                    }
                    .play-buttons-container, .logo-wrapper {
                        display: flex;
                    }
                    .play-buttons-container {
                        margin-left: auto;
                    }
                    .logo-wrapper {
                        margin-left: 8px;
                    }
                    button {
                        padding: 5px 8px;
                        margin: 0 5px;
                        width: 3.2rem;
                        background-color: #25386f;
                        color: #ffffff;
                        font: inherit;
                        cursor: pointer;
                        border: 2px solid transparent;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        border-radius: 5px;
                    }
                    button:hover {
                        background-color: #ffffff;
                        color: #25386f;
                        border: 2px solid #25386f;

                    }
                    a:visited {
                        color: inherit;
                    }
                    
                </style>
            </head>
            <body>
                ${playControls}
                <div id="container" style="max-width: 900px; max-height: 500px;"></div>
                <script>
                    Highcharts.setOptions({
                        palette: {
                            colorScheme: 'light'
                        },
                        accessibility: {
                            screenReaderSection: {
                                beforeChartFormat: '<h2>{chartTitle}</h2>' +
                                    '<div>{typeDescription}</div>' +
                                    '<div>{chartSubtitle}</div>' +
                                    '<div>{chartLongdesc}</div>' +
                                    '<div>{playAsSoundButton}</div>' +
                                    '<div>{viewTableButton}</div>' +
                                    '<div>{xAxisDescription}</div>' +
                                    '<div>{yAxisDescription}</div>'
                            }
                        },
                        sonification: {
                            events: {
                                onEnd: function () {
                                    document.getElementById('play-button').textContent = 'Play';
                                },
                            }
                        }
                    });
                    const options = ${optionsString};
                    // The series and point names are escaped, so the chart
                    // shows them as text: decode them in the aria-labels too,
                    // as the editor does (plainTextAriaLabelPlugin)
                    const container = document.getElementById('container');
                    const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
                    // The labels decoded, so that one is not decoded again
                    // when its decoded text has an entity in it
                    const decodedLabels = new WeakMap();
                    const decodeLabel = function (element) {
                        const label = element.getAttribute && element.getAttribute('aria-label');
                        if (label && label !== decodedLabels.get(element) &&
                                /&(amp|lt|gt|quot|#39);/.test(label)) {
                            const decoded = label.replace(
                                /&(amp|lt|gt|quot|#39);/g,
                                function (entity) { return entities[entity]; }
                            );
                            decodedLabels.set(element, decoded);
                            element.setAttribute('aria-label', decoded);
                        }
                    };
                    new MutationObserver(function (records) {
                        records.forEach(function (record) {
                            decodeLabel(record.target);
                            record.addedNodes.forEach(function (node) {
                                if (node.querySelectorAll) {
                                    decodeLabel(node);
                                    node.querySelectorAll('[aria-label]').forEach(decodeLabel);
                                }
                            });
                        });
                    }).observe(container, {
                        subtree: true, childList: true, attributes: true, attributeFilter: ['aria-label']
                    });
                    const chart = Highcharts.chart(container, options);
                    container.querySelectorAll('[aria-label]').forEach(decodeLabel);

                    document.getElementById('play-button').onclick = function () {
                        const btn = this;
                        const timeline = chart.sonification.timeline;
                        
                        if (chart.sonification.isPlaying()) {
                            timeline.pause();
                            btn.textContent = 'Play';
                        } else if (timeline && timeline.isPaused) {
                            timeline.resume();
                            btn.textContent = 'Pause'
                        } else {
                            chart.sonify();
                            btn.textContent = 'Pause';
                        }
                    }
                    document.getElementById('reset-button').onclick = function () {
                        const playBtn = document.getElementById('play-button');
                        const timeline = chart.sonification.timeline;
                        if (timeline){
                            timeline.reset();
                            chart.xAxis[0].hideCrosshair();
                            playBtn.textContent = 'Play';
                            
                        }
                    }
                </script>
            </body>
            </html>
        `;
    }

    public getAvailableInstruments(): Array<Record<'name' | 'value', string>> {
        return Object.keys(this.Highcharts.sonification.InstrumentPresets || {}).map((i) => ({
            name: i[0].toUpperCase() + i.slice(1),
            value: i,
        }));
    }

    public getMinMaxValuesForProp(prop: string): Record<'min' | 'max', number> {
        if (!this.chart) {
            return { min: 0, max: 100 };
        }

        const axis = prop === 'x' ? this.chart.xAxis?.[0] : this.chart.yAxis?.[0];

        if (!axis || axis.dataMin === undefined || axis.dataMax === undefined) {
            return { min: 0, max: 100 };
        }

        return {
            min: axis.dataMin,
            max: axis.dataMax,
        };
    }

    public downloadChartConfig(): void {
        const options = this.getChartOptionsForExport();
        const json = JSON.stringify(options, void 0, 2);
        const blob = new Blob([json], { type: 'text/json' });
        const uri = window.URL.createObjectURL(blob);
        const filename = this.getChartTitleForExport() + '.json';
        downloadURI(uri, filename);
    }

    public downloadHTMLFile(): void {
        const htmlContent = this.getHTMLChartConfig();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const uri = window.URL.createObjectURL(blob);
        const filename = (this.getChartTitleForExport() + '.html').replace(/ /g, '_').toLowerCase();
        downloadURI(uri, filename);
    }

    public downloadAudio(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.browserSupportsRecording()) {
                reject(
                    new Error(
                        'Browser does not support media recording. Audio could not be downloaded.'
                    )
                );
            }
            if (!this.chart?.sonification) {
                reject(new Error('Could not download audio, no chart defined.'));
                return;
            }

            const context: AudioContext = this.chart?.sonification?.audioContext;
            if (!context) {
                reject(new Error('Could not download audio, no audio context available.'));
                return;
            }
            this.stopPlaybackForExport();
            const destination = context.createMediaStreamDestination();
            this.setAudioDestinationNode(destination);

            const recorder = this.recordStream(destination.stream, true, resolve, reject);

            setTimeout(
                () =>
                    this.playChart(() =>
                        setTimeout(() => {
                            recorder.stop();
                            this.setAudioDestinationNode();
                        }, 300)
                    ),
                300
            );
        });
    }

    public downloadVideo(framerate: number): Promise<void> {
        if (!this.browserSupportsRecording()) {
            throw new Error(
                'Browser does not support media recording. Video could not be downloaded.'
            );
        }

        const canvas = document.createElement('canvas');
        const chartEl: HTMLElement | undefined = this.chart?.renderer?.box;
        if (!chartEl) {
            throw new Error('downloadVideo: Could not find chart.');
        }
        // Safari needs the canvas width/height to get resolution for video stream.
        canvas.width = chartEl.offsetWidth;
        canvas.height = chartEl.offsetHeight;

        const unusedCtx = canvas.getContext('2d'); // Because of bug in firefox, must get context before capt.stream.
        const canvasStream = canvas.captureStream(framerate);
        if (!canvasStream) {
            console.log('Canvas context:', unusedCtx); // Use context so it is not optimized away.
            throw new Error('Canvas capture stream not supported.');
        }
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (!videoTrack) {
            throw new Error('Could not get canvas video track.');
        }

        const audioContext: AudioContext = this.chart?.sonification?.audioContext;
        if (!audioContext) {
            throw new Error('Could not export video, no audio context available.');
        }
        this.stopPlaybackForExport();
        const audioDestination = audioContext.createMediaStreamDestination();
        const exportStream = audioDestination.stream;
        exportStream.addTrack(videoTrack);
        this.setAudioDestinationNode(audioDestination);

        // Add credits before exporting
        this.chart?.update({
            credits: { enabled: true },
        });

        return new Promise((resolve, reject) =>
            setTimeout(() => {
                const recorder = this.recordStream(exportStream, false, void 0, reject);
                const chartPainter = setInterval(() => {
                    this.drawChartOnCanvas(canvas).catch((e) => {
                        clearInterval(chartPainter);
                        recorder.stop();
                        this.setAudioDestinationNode();
                        reject(e);
                    });
                }, 1000 / framerate);

                this.playChart(() =>
                    setTimeout(() => {
                        recorder.stop();
                        this.setAudioDestinationNode();
                        clearInterval(chartPainter);

                        // Remove credits again after export
                        this.chart?.update({
                            credits: { enabled: false },
                        });

                        resolve();
                    }, 200)
                );
            }, 200)
        );
    }

    private recordStream(
        stream: MediaStream,
        audioOnly: boolean,
        onEnd?: () => void,
        onError?: (e: { error: DOMException }) => void
    ): GenericObject {
        const recorder = this.getMediaRecorder(stream, audioOnly);
        const data: Blob[] = [];
        recorder.ondataavailable = (e: GenericObject) => {
            data.push(e.data);
        };
        recorder.onstop = () => {
            const blob = new Blob(data, { type: recorder.mimeType });
            const url = URL.createObjectURL(blob);
            const filename =
                this.getChartTitleForExport() +
                '.' +
                this.getFileExtensionFromMimeType(recorder.mimeType);
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
            const imgURL = (win.URL || win.webkitURL || win).createObjectURL(
                new win.Blob([svg], {
                    type: 'image/svg+xml',
                })
            );
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
        const Recorder = window.MediaRecorder;
        const preferredMimeTypes = audioOnly
            ? [
                  'audio/wav',
                  'audio/mpeg',
                  'audio/mp3',
                  'audio/mp4',
                  'audio/ogg',
                  'audio/x-aiff',
                  'audio/webm',
              ]
            : ['video/mp4', 'video/webm'];
        const mimeType = preferredMimeTypes.find((type) => Recorder.isTypeSupported(type));
        if (!mimeType) {
            throw new Error('Media recording not supported by browser, no supported file format.');
        }
        return new Recorder(stream, {
            mimeType,
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
            'video/webm': 'webm',
        };
        const extension = Object.keys(mapping).find((key) => mimeType.indexOf(key) > -1);
        if (!extension) {
            throw new Error('Unknown mime type ' + mimeType);
        }
        return mapping[extension];
    }

    private browserSupportsRecording(): boolean {
        return 'MediaRecorder' in window;
    }

    private setAudioDestinationNode(node?: AudioNode) {
        this.chart?.sonification?.setAudioDestination(
            node || this.chart?.sonification?.audioContext?.destination
        );
    }

    // Keep the series' visible parameter in sync with the legend, which hides
    // and shows a series when its legend item is clicked (also from the
    // keyboard, which the accessibility module turns into a click). Without
    // it, the next chart update would apply the old visibility again.
    //
    // This uses the legend's itemClick event, which fires before its default
    // action toggles the series' visibility. The series' legendItemClick event
    // fires only after that, since Highcharts 11, so the series' visible
    // property no longer tells which way it is toggled.
    private getLegendItemHookOptions(): GenericObject {
        return {
            legend: {
                events: {
                    itemClick: (e: HighchartsModule.LegendItemClickEventObject) => {
                        const item = e.legendItem;
                        // Pie charts have points as legend items
                        if (item instanceof this.Highcharts.Series) {
                            this.seriesParametersStore.setSeriesParameter({
                                seriesId: getSeriesId(item),
                                parameterName: 'seriesVisible',
                                parameterValue: !item.visible,
                            });
                        }
                    },
                },
            },
        };
    }

    // Highcharts throws away the chart's sonification timeline and builds a
    // new one on every render of the chart, which stops playback: also when
    // nothing that plays changed, as when the chart is resized (e.g. when the
    // sidebar is hidden) or redrawn, or when a Google Sheet is polled and has
    // not changed (see the data's complete handler). So the
    // new timeline picks up where the old one was, playing or paused, as its
    // own pause and resume do. A change to the settings or the data still
    // stops playback (in PlayButtons), once the change reaches the bridge.
    private getTimelineUpdateHookOptions(): GenericObject {
        return {
            sonification: {
                events: {
                    beforeUpdate: (e: { timeline?: ChartTimeline }) => {
                        this.playbackHandoff = this.getPlaybackHandoff(e.timeline);
                    },
                    afterUpdate: (e: { timeline?: ChartTimeline }) => {
                        const handoff = this.playbackHandoff;
                        this.playbackHandoff = null;
                        if (handoff && e.timeline) {
                            this.continuePlayback(e.timeline, handoff);
                        }
                    }
                }
            }
        };
    }

    private getPlaybackHandoff(timeline?: ChartTimeline): PlaybackHandoff | null {
        if (!timeline || !timeline.isPlaying && !timeline.isPaused) {
            return null;
        }
        return { playing: timeline.isPlaying, time: timeline.getCurrentTime() };
    }

    // Put a new timeline where playback was on the old one: paused at its
    // time, and playing on from there if it was playing
    private continuePlayback(timeline: ChartTimeline, handoff: PlaybackHandoff): void {
        timeline.playingChannels = timeline.channels;
        timeline.resumeFromTime = handoff.time;
        timeline.isPaused = true;
        timeline.onEndArgument = this.playbackOnEnd;
        if (handoff.playing) {
            timeline.resume();
        }
    }

    private isPlaying(): boolean {
        return this.chart?.sonification?.isPlaying();
    }

    // Since Highcharts 13, the data module reports a failed Google Sheets
    // request with Highcharts.error() instead of calling a data.error callback.
    private onHighchartsError(e: HighchartsErrorEvent) {
        const message = getGoogleSheetsErrorMessage(e.message);
        if (
            message === null ||
            !this.chart ||
            e.chart !== this.chart ||
            this.dataStore.selectedDataSource !== 'googlesheets'
        ) {
            return;
        }

        // Handled here, so Highcharts does not log it as a warning
        e.preventDefault();
        this.dataStore.setGoogleSheetErrorMessage(message);
        this.dataStore.setGoogleSheetStatus(GoogleSheetStatus.Error);
    }

    // Queue reactivity updates after every action on the parameter stores
    // and the data store (whether or not it changed anything). Detached: the
    // subscriptions last as long as the app.
    private subscribeToStoreActions() {
        const afterParameterAction = () => {
            if (this.chart && this.chart.options) {
                this.queueNewParamReactivity();
            }
        };
        const afterDataAction = () => {
            if (this.chart && this.chart.options) {
                this.queueNewDataReactivity();
            }
        };
        this.chartParametersStore.$onAction(({ after }) => after(afterParameterAction), true);
        this.seriesParametersStore.$onAction(({ after }) => after(afterParameterAction), true);
        this.globalSonifyParametersStore.$onAction(({ after }) => after(afterParameterAction), true);
        this.dataStore.$onAction(({ name, after }) => {
            // The text description isn't chart data, and a data update stops
            // playback (PlayButtons), so typing a description while listening
            // must not count as one.
            if (name !== 'setTextDescription') {
                after(afterDataAction);
            }
        }, true);
    }

    // Trigger a reactivity update, but only once every X milliseconds.
    private queueReactivityUpdate(
        trigger: () => void,
        interval: number,
        timeoutId: string,
        beforeTrigger?: () => void
    ) {
        const timeouts = this.reactivityTimeouts;
        if (!timeouts[timeoutId]) {
            timeouts[timeoutId] = setTimeout(() => {
                delete timeouts[timeoutId];
                if (beforeTrigger) {
                    beforeTrigger();
                }
                trigger();
            }, interval);
        }
    }

    private queueNewParamReactivity() {
        this.queueReactivityUpdate(
            () => this.viewStore.triggerParameterReactivity(),
            ChartBridge.parameterReactivityIntervalMs,
            'paramReactivityTimeout',
            () => this.updateChartOptions()
        );
    }

    private queueNewDataReactivity() {
        this.queueReactivityUpdate(
            () => this.viewStore.triggerDataReactivity(),
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
                this.globalSonifyParametersStore.$state,
                this.chartParametersStore.$state,
                this.chart || {}
            );
        }
    }

    private buildSeriesOptions(seriesIds: string[]): GenericObject[] | null {
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
        if (!series || !Array.isArray(series)) {
            return;
        }

        const opts = this.chart?.options || this.Highcharts.getOptions();
        const threshold: number =
            opts?.accessibility?.series?.pointDescriptionEnabledThreshold || 8000;

        series.forEach((seriesOpts) => {
            if (!seriesOpts || !seriesOpts.data || !Array.isArray(seriesOpts.data)) {
                return;
            }

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
            this.updatePlayProgress.bind(this),
            ChartBridge.updateProgressIntervalMs
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
        const totalDuration = chart.options?.sonification?.duration || 1,
            curTime = chart.sonification?.timeline?.getCurrentTime() || 0,
            progressPct = Math.round((100 * curTime) / totalDuration);
        this.viewStore.setPlaybackProgress(progressPct);
    }
}
