/* *
 *
 *  (c) 2009-2020 Øystein Moseng
 *
 *  Popup dialog for data filter.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
/* eslint-disable no-invalid-this, valid-jsdoc */
import H from '../../parts/Globals.js';
var doc = H.doc;
import PopupDialog from './PopupDialog.js';
import DataFilter from './DataFilter.js';
/**
 * @private
 */
var DataFilterDialog = /** @class */ (function () {
    function DataFilterDialog(chart, options) {
        this.chart = chart;
        this.dialog = new PopupDialog('Filter data', chart.renderTo, null, options);
    }
    DataFilterDialog.prototype.buildContent = function (options) {
        this.caseSensitive = options.caseSensitive;
        this.dialog.setContent(this.getDialogContent(options));
    };
    DataFilterDialog.prototype.show = function () {
        this.updateTotalPoints();
        this.dialog.show();
    };
    DataFilterDialog.prototype.destroy = function () {
        this.dialog.destroy();
    };
    DataFilterDialog.prototype.getDialogContent = function (options) {
        if (this.contentContainer) {
            this.contentContainer.remove();
            delete this.contentContainer;
            delete this.totalPointsElement;
            delete this.filterKeyElement;
            delete this.predicateElement;
            delete this.argumentContainer;
            delete this.buttonContainer;
            delete this.argumentElement;
        }
        var contentContainer = this.contentContainer = doc.createElement('div');
        contentContainer.appendChild(this.makeHeadingElement());
        if (options.showTotalPoints) {
            this.totalPointsElement = this.totalPointsElement || this.makeTotalPointsElement();
            this.updateTotalPoints();
            contentContainer.appendChild(this.totalPointsElement);
        }
        this.argumentContainer = this.makeArgumentContainer();
        var keys = this.getFilterKeys(options.keys);
        this.filterKeyElement = this.makeFilterKeyElement(keys);
        contentContainer.appendChild(this.filterKeyElement);
        this.predicateElement = this.makePredicateElement(options.predicates);
        contentContainer.appendChild(this.predicateElement);
        contentContainer.appendChild(this.argumentContainer);
        var buttonContainer = this.buttonContainer = this.makeButtonContainer();
        buttonContainer.appendChild(this.makeApplyButtonElement());
        buttonContainer.appendChild(this.makeResetButtonElement());
        contentContainer.appendChild(buttonContainer);
        return contentContainer;
    };
    DataFilterDialog.prototype.makeHeadingElement = function () {
        var heading = doc.createElement('p');
        heading.style.cssText = 'font-size: 1.4em; color: #444; margin-top: 5px';
        heading.textContent = 'Filter data';
        return heading;
    };
    DataFilterDialog.prototype.makeTotalPointsElement = function () {
        var total = doc.createElement('p');
        total.style.cssText = 'font-size: 1em; color: #444;';
        return total;
    };
    DataFilterDialog.prototype.updateTotalPoints = function () {
        if (!this.totalPointsElement) {
            return;
        }
        var totalPoints = this.chart.getNumPoints();
        var visiblePoints = this.chart.getNumPointsVisible();
        this.totalPointsElement.innerHTML =
            "Currently showing " + visiblePoints + " of " + totalPoints + " data points.";
    };
    DataFilterDialog.prototype.getFilterKeys = function (keys) {
        if (keys) {
            return keys;
        }
        var capitalize = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
        return this.chart.series.reduce(function (chartKeys, series) {
            (series.pointArrayMap || []).forEach(function (seriesKey) {
                chartKeys[seriesKey] = capitalize(seriesKey);
            });
            return chartKeys;
        }, {});
    };
    DataFilterDialog.prototype.makeFilterKeyElement = function (keys) {
        var _this = this;
        var curFilterKey = this.currentFilterKey = this.currentFilterKey || Object.keys(keys)[0];
        var select = doc.createElement('select');
        select.style.cssText = 'width: 125px; margin: 5px 5px 0 0; font-size: 0.8em; color: #333';
        select.setAttribute('aria-label', 'Filter by');
        Object.keys(keys).forEach(function (pointKey) {
            var option = doc.createElement('option');
            option.innerHTML = keys[pointKey];
            option.value = pointKey;
            option.selected = curFilterKey === pointKey;
            select.appendChild(option);
        });
        select.onchange = function (e) {
            _this.currentFilterKey = e.target.value;
        };
        return select;
    };
    DataFilterDialog.prototype.makePredicateElement = function (predicates) {
        var _this = this;
        var curPredicate = this.currentPredicate = this.currentPredicate || predicates[0];
        var select = doc.createElement('select');
        select.style.cssText = 'width: 125px; margin: 0 5px 0 5px; font-size: 0.8em; color: #333';
        select.setAttribute('aria-label', 'Filter operator');
        predicates.forEach(function (predicate) {
            var option = doc.createElement('option');
            option.innerHTML = DataFilter.getPredicateName(predicate);
            option.selected = predicate === curPredicate;
            option.value = predicate;
            select.appendChild(option);
        });
        this.updateArgumentElement();
        select.onchange = function (e) {
            _this.currentPredicate = e.target
                .value;
            _this.updateArgumentElement();
        };
        return select;
    };
    DataFilterDialog.prototype.makeArgumentContainer = function () {
        var container = doc.createElement('div');
        container.style.cssText = 'margin-top: 8px; width: 100%';
        return container;
    };
    DataFilterDialog.prototype.makeButtonContainer = function () {
        var container = doc.createElement('div');
        container.style.cssText = 'width: 100%; margin-top: 10px; text-align: center';
        return container;
    };
    DataFilterDialog.prototype.makeResetButtonElement = function () {
        var _this = this;
        var btn = doc.createElement('button');
        btn.style.cssText = DataFilterDialog.buttonStyle;
        btn.innerHTML = 'Reset';
        btn.onclick = function () {
            _this.chart.clearDataFilter();
            _this.dialog.hide();
        };
        return btn;
    };
    DataFilterDialog.prototype.makeApplyButtonElement = function () {
        var _this = this;
        var btn = doc.createElement('button');
        btn.style.cssText = DataFilterDialog.buttonStyle;
        btn.innerHTML = 'Apply';
        btn.onclick = function () { return _this.onApplyClick(); };
        return btn;
    };
    DataFilterDialog.prototype.updateArgumentElement = function () {
        var _this = this;
        var _a, _b;
        var argElement = this.argumentElement;
        var curPredicate = this.currentPredicate;
        var newArgType = curPredicate && DataFilter.getPredicateArgumentType(curPredicate);
        var newInputType = newArgType && this.getInputTypeFromArgumentType(newArgType);
        var shouldUpdateArgument = ((_a = argElement) === null || _a === void 0 ? void 0 : _a.type) !== newInputType;
        if (!shouldUpdateArgument) {
            return;
        }
        if (argElement) {
            argElement.remove();
            delete this.argumentElement;
        }
        if (newInputType) {
            argElement = this.argumentElement = doc.createElement('input');
            argElement.style.cssText = 'display: block; box-sizing: border-box; margin: 5px auto;' +
                'width: 100%; font-size: 0.8em; color: #333; padding: 2px 8px;';
            argElement.type = newInputType;
            argElement.setAttribute('aria-label', 'Filter value');
            argElement.onchange = function (e) {
                _this.currentArgumentValue = e.target.value;
            };
            argElement.onkeydown = function (e) {
                var keycode = e.which || e.keyCode;
                var enter = 13;
                if (keycode === enter) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this.onApplyClick();
                }
            };
            // Init the value of the input
            var oldValue = this.currentArgumentValue;
            var oldType = this.currentArgumentType;
            if (newInputType === oldType && typeof oldValue !== 'undefined') {
                argElement.value = oldValue;
            }
            else if (newInputType === 'number') {
                argElement.value = '0';
            }
            this.currentArgumentType = newInputType;
            (_b = this.argumentContainer) === null || _b === void 0 ? void 0 : _b.appendChild(argElement);
        }
    };
    DataFilterDialog.prototype.onApplyClick = function () {
        var keySelect = this.filterKeyElement;
        var predicate = this.currentPredicate;
        if (!keySelect || !predicate) {
            return;
        }
        var key = keySelect.options[keySelect.selectedIndex].value;
        var argumentValue = (this.argumentElement || {}).value;
        var argIsNumber = DataFilter.getPredicateArgumentType(predicate) === 'number';
        var argument = argIsNumber && argumentValue ? parseFloat(argumentValue) : argumentValue;
        var filter = new DataFilter(key, predicate, argument, {
            caseSensitive: this.caseSensitive
        });
        this.chart.applyDataFilter(filter);
        this.dialog.hide();
    };
    DataFilterDialog.prototype.getInputTypeFromArgumentType = function (argType) {
        if (!argType) {
            return '';
        }
        return argType === 'number' ? 'number' : 'text';
    };
    DataFilterDialog.buttonStyle = 'margin: 5px 10px; width: 100px; padding: 6px 15px' +
        'border-width: 0px; border-radius: 14px; font: inherit; font-size: 14px; font-weight: bold;' +
        'cursor: pointer; background-color: #25386f; color: #ffffff';
    return DataFilterDialog;
}());
export default DataFilterDialog;
