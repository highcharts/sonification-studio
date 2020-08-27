/* *
 *
 *  (c) 2009-2020 Øystein Moseng
 *
 *  Add data filtering capabilities to Highcharts.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import H from '../../parts/Globals.js';
import _DataFilter from './DataFilter.js';
import DataFilterDialog from './DataFilterDialog.js';
/* eslint-disable no-invalid-this, valid-jsdoc */
import defaultOptions from './options.js';
import defaultLangOptions from './langOptions.js';
import U from '../../parts/Utilities.js';
var addEvent = U.addEvent, extend = U.extend, merge = U.merge;
// Merge default options
merge(true, H.defaultOptions, defaultOptions, {
    lang: defaultLangOptions
});
// Make DataFilter class available on Highcharts scope
H.DataFilter = _DataFilter;
/**
 * Apply a data filter to a chart. Will override current
 * visibility of series and points in the chart.
 *
 * @requires module:modules/data-filter
 *
 * @function Highcharts.Chart#applyDataFilter
 *
 * @param {Highcharts.DataFilter} dataFilter
 *          The data filter to apply to the chart, as an
 *          instance of the DataFilter class.
 */
H.Chart.prototype.applyDataFilter = function (dataFilter) {
    this.series.forEach(function (series) {
        // Make all series visible
        series.setVisible(true, false);
        // Set visibility of individual points
        series.points.forEach(function (point) {
            var shouldBeVisible = dataFilter.execute(point);
            if (point.visible !== shouldBeVisible) {
                if (point.setVisible) {
                    point.setVisible(shouldBeVisible, false);
                }
                else {
                    point.update({
                        visible: shouldBeVisible
                    }, false);
                }
            }
        });
    });
    this.redraw();
};
/**
 * Remove all data filters from chart, make all points visible.
 *
 * @requires module:modules/data-filter
 *
 * @function Highcharts.Chart#clearDataFilter
 */
H.Chart.prototype.clearDataFilter = function () {
    var emptyFilter = new H.DataFilter();
    this.applyDataFilter(emptyFilter);
};
/**
 * Show the popup dialog for applying data filters.
 *
 * @requires module:modules/data-filter
 *
 * @function Highcharts.Chart#showDataFilterDialog
 */
H.Chart.prototype.showDataFilterDialog = function () {
    var _this = this;
    var dialogOptions = {
        onClose: function () {
            var _a;
            var announcer = (_a = _this.accessibility) === null || _a === void 0 ? void 0 : _a.components.infoRegions.announcer;
            var visiblePoints = _this.getNumPointsVisible();
            var totalPoints = _this.getNumPoints();
            if (announcer) {
                announcer.announce("Dialog closed. Currently showing " + visiblePoints + " of " + totalPoints + " data points.");
                var svg = _this.renderer.box;
                if (!svg.hasAttribute('tabindex')) {
                    svg.setAttribute('tabindex', '-1');
                }
                svg.focus();
            }
        }
    };
    var dialog = this.dataFilterDialog = this.dataFilterDialog || new DataFilterDialog(this, dialogOptions);
    var opts = this.options.dataFilter;
    if (opts) {
        dialog.buildContent(opts);
        dialog.show();
    }
};
/**
 * @private
 */
H.Chart.prototype.getNumPointsVisible = function () {
    return this.series.reduce(function (total, series) {
        var visiblePointsInSeries = series.points.reduce(function (seriesTotal, point) {
            return seriesTotal + (point.visible ? 1 : 0);
        }, 0);
        return total + visiblePointsInSeries;
    }, 0);
};
/**
 * @private
 */
H.Chart.prototype.getNumPoints = function () {
    return this.series.reduce(function (total, series) {
        return total + series.points.length;
    }, 0);
};
// Update options with chart updates
addEvent(H.Chart, 'update', function (e) {
    var newOptions = e.options.dataFilter;
    if (newOptions) {
        merge(true, this.options.dataFilter, newOptions);
    }
});
// Add to export menu
var exportingOptions = Highcharts.getOptions().exporting;
if (exportingOptions) {
    extend(exportingOptions.menuItemDefinitions, {
        filterData: {
            textKey: 'filterDataMenuText',
            onclick: function () {
                this.showDataFilterDialog();
            }
        }
    });
    if (exportingOptions.buttons) {
        exportingOptions.buttons.contextButton.menuItems.push('filterData');
    }
}
