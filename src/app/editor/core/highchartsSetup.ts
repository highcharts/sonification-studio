/*
    The Highcharts instance used by the editor, with the modules, theme and
    plugins the app depends on. The chart rendered by highcharts-vue (which
    imports 'highcharts' itself) and the ChartBridge both use this instance.
*/

import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/stock';
import 'highcharts/modules/data';
import 'highcharts/modules/exporting';
import 'highcharts/modules/offline-exporting';
import 'highcharts/modules/series-label';
import 'highcharts/modules/no-data-to-display';
import 'highcharts/modules/sonification';
import 'highcharts/modules/accessibility';
import 'highcharts/themes/high-contrast-light';
import { negativeLogPlugin } from './utils/chartUtils';

negativeLogPlugin(Highcharts);

export default Highcharts;
