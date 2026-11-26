/*
    The one Highcharts instance used by the editor, with the modules, theme and
    plugins the app depends on. The modules register themselves on the
    instance that the 'highcharts' import returns. The chart rendered by
    highcharts-vue (passed this instance in Preview.vue), the ChartBridge and
    the project menu all use it.

    Client-side PNG and SVG export is part of the exporting module itself
    (since Highcharts 12.3). The offline-exporting module only adds PDF export,
    which the app does not offer, and in Highcharts 13 it warns on every chart
    load unless the PDF libraries are configured, so it is not loaded.
*/

import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/stock';
import 'highcharts/modules/data';
import 'highcharts/modules/exporting';
import 'highcharts/modules/series-label';
import 'highcharts/modules/no-data-to-display';
import 'highcharts/modules/sonification';
import 'highcharts/modules/accessibility';
// Highcharts 13 renamed the high-contrast-light theme to high-contrast
import 'highcharts/themes/high-contrast';
import { negativeLogPlugin } from './utils/chartUtils';

// Highcharts 13 charts follow the system's light or dark mode by default.
// The app's interface is light only, so keep the chart light, as before.
// Set globally rather than per chart, so the chart's colors stay defined on
// :root, where the SVG snapshots for video export still find them.
Highcharts.setOptions({
    palette: {
        colorScheme: 'light'
    }
});

negativeLogPlugin(Highcharts);

export default Highcharts;
