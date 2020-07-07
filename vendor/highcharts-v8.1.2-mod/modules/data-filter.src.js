/**
 * @license Highcharts JS v8.0.0 (2020-03-02)
 *
 * Data filtering module
 *
 * (c) 2010-2020 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/data-filter', ['highcharts'], function (Highcharts) {
            factory(Highcharts);
            factory.Highcharts = Highcharts;
            return factory;
        });
    } else {
        factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
    }
}(function (Highcharts) {
    var _modules = Highcharts ? Highcharts._modules : {};
    function _registerModule(obj, path, args, fn) {
        if (!obj.hasOwnProperty(path)) {
            obj[path] = fn.apply(null, args);
        }
    }
    _registerModule(_modules, 'modules/data-filter/DataFilter.js', [_modules['parts/Utilities.js']], function (U) {
        /* *
         *
         *  (c) 2009-2020 Øystein Moseng
         *
         *  The DataFilter class.
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /* eslint-disable no-invalid-this, valid-jsdoc */
        var defined = U.defined,
                            getNestedProperty = U.getNestedProperty;
        /**
         * @private
         */
        function makePredicate(name, execute, argumentType) {
            return { name: name, execute: execute, argumentType: argumentType };
        }
        /**
         * An Earcon configuration, specifying an Earcon and when to play it.
         *
         * @requires module:modules/data-filter
         *
         * @interface Highcharts.DataFilterOptions
         */ /**
        * Whether or not to apply the filter with case sensitivity. Only applies
        * to string arguments. If not specified, the filter defaults to being
        * case insensitive.
        * @name Highcharts.DataFilterOptions#caseSensitive
        * @type {boolean}
        */
        /**
         * A DataFilter that can be applied to a chart.
         *
         * ```js
         *  var filterJohnPoints = new DataFilter('name', 'contains', 'John');
         *  var filterBigValues = new DataFilter('y', 'greaterThan', 10000000);
         *  var filterPointsWithValue = new DataFilter('y', 'hasValue');
         *```
         *
         * @class
         * @name Highcharts.DataFilter
         *
         * @requires module:modules/data-filter
         *
         * @param {string} [key]
         *  The data point property to filter on. Can be a nested key, using dot
         *  notation. If a key is not provided, the filter always returns `true`.
         * @param {string} [predicate]
         *  The predicate/comparison to run when filtering. The following predicates
         *  are supported: `equals`, `contains`, and `startsWith` compare string values.
         *  `lessThan` and `greaterThan` compare numbers. `hasValue` checks that the
         *  property is not `null` or `undefined`. If a predicate is not provided,
         *  the filter always returns `true`.
         * @param {*} [argument]
         *  The constant to compare the point properties to. Note that the argument
         *  type must match the type expected by the predicate used. The `hasValue`
         *  predicate does not require an argument.
         * @param {Highcharts.DataFilterOptions} [options]
         *  Options for the filter.
         */
        var DataFilter = /** @class */ (function () {
                                function DataFilter(key, predicate, argument, options) {
                                    this.key = key;
                this.argument = argument;
                this.options = options;
                if (predicate) {
                    this.predicate = DataFilter.predicates[predicate];
                    this.verifyArgumentType();
                }
            }
            /**
             * Execute the data filter against a point in the chart to determine if
             * it should be filtered out or not.
             *
             * @function Highcharts.DataFilter#execute
             *
             * @param {Highcharts.Point} point The point to execute the filter on.
             *
             * @return {boolean} Whether or not the point should be hidden.
             */
            DataFilter.prototype.execute = function (point) {
                var _a;
                if (!this.key || !this.predicate) {
                    return true;
                }
                var prop = getNestedProperty(this.key,
                                    point);
                var argument = this.argument;
                var shouldConvertToLowercase = !((_a = this.options) === null || _a === void 0 ? void 0 : _a.caseSensitive);
                var toLower = function (x) {
                                        return typeof x === 'string' ? x.toLowerCase() : x;
                };
                return this.predicate.execute(shouldConvertToLowercase ? toLower(prop) : prop, shouldConvertToLowercase ? toLower(argument) : argument);
            };
            /**
             * Get the human readable name of a predicate function.
             *
             * @function Highcharts.DataFilter#getPredicateName
             *
             * @param {string} predicate The predicate to get the name of, e.g. `lessThan`.
             *
             * @return {string} The human readable name of the predicate.
             */
            DataFilter.getPredicateName = function (predicate) {
                return DataFilter.predicates[predicate].name;
            };
            /**
             * Get the the predicate argument type of a predicate function.
             *
             * @function Highcharts.DataFilter#getPredicateArgumentType
             *
             * @param {string} predicate The predicate to get the argument of, e.g. `lessThan`.
             *
             * @return {"string"|"number"|""} The type of the predicate argument.
             */
            DataFilter.getPredicateArgumentType = function (predicate) {
                var arg = DataFilter.predicates[predicate].argumentType;
                if (arg === String) {
                    return 'string';
                }
                if (arg === Number) {
                    return 'number';
                }
                return '';
            };
            /**
             * @private
             */
            DataFilter.prototype.verifyArgumentType = function () {
                var _a,
                                    _b;
                var arg = this.argument;
                var predicateArgType = (_a = this.predicate) === null || _a === void 0 ? void 0 : _a.argumentType;
                if (predicateArgType &&
                    ((_b = arg) === null || _b === void 0 ? void 0 : _b.constructor) !== predicateArgType) {
                    // Is it worth creating a proper Highcharts error # for this?
                    throw new Error('Highcharts: DataFilter argument not matching predicate type.');
                }
            };
            DataFilter.predicates = {
                equals: makePredicate('Equals', function (a, b) {
                    return '' + a === b;
                }, String),
                contains: makePredicate('Contains', function (a, b) {
                    return ('' + a).indexOf(b) > -1;
                }, String),
                startsWith: makePredicate('Starts with', function (a, b) {
                    return ('' + a).indexOf(b) === 0;
                }, String),
                lessThan: makePredicate('Less than', function (a, b) {
                    return a < b;
                }, Number),
                greaterThan: makePredicate('Greater than', function (a, b) {
                    return a > b;
                }, Number),
                hasValue: makePredicate('Has value', function (a) { return defined(a); })
            };
            return DataFilter;
        }());

        return DataFilter;
    });
    _registerModule(_modules, 'modules/data-filter/PopupDialog.js', [_modules['parts/Globals.js']], function (H) {
        /* *
         *
         *  (c) 2009-2020 Øystein Moseng
         *
         *  Generic accessible popup dialog.
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /* eslint-disable no-invalid-this, valid-jsdoc */
        var doc = H.doc;
        var userAgent = H.win.navigator.userAgent;
        /**
         * @private
         */
        var PopupDialog = /** @class */ (function () {
                                function PopupDialog(title, parentDiv, content, options) {
                                    var _this = this;
                this.parentDiv = parentDiv;
                this.options = options;
                this.useFlex = !(/msie/i.test(userAgent)); // Don't use flexbox on IE
                var dc = this.dialogContainer = doc.createElement('div');
                dc.className = 'highcharts-popup-dialog';
                dc.setAttribute('aria-hidden', 'false'); // To ensure a11y module does not hide it
                var flexContainer = this.flexContainer = doc.createElement('div');
                var dialogBox = this.dialogBox = doc.createElement('div');
                dialogBox.setAttribute('role', 'dialog');
                dialogBox.setAttribute('aria-label', title);
                dialogBox.setAttribute('tabindex', '-1');
                dialogBox.onkeydown = function (e) {
                    var keycode = e.which || e.keyCode;
                    var esc = 27;
                    if (keycode === esc) {
                        _this.hide();
                    }
                    e.stopPropagation(); // Stop a11y module from stealing kbd focus
                };
                var innerContainer = this.innerContainer = doc.createElement('div');
                var contentContainer = this.contentContainer = doc.createElement('div');
                contentContainer.className = 'highcharts-popup-content-container';
                var closeButton = this.closeButton = doc.createElement('button');
                closeButton.setAttribute('aria-label', 'Close dialog');
                closeButton.innerHTML = this.getCloseButtonContent();
                closeButton.className = 'highcharts-popup-close-button';
                closeButton.onclick = function () { return _this.hide(); };
                this.addDialogStyle();
                if (content) {
                    this.setContent(content);
                }
                innerContainer.appendChild(contentContainer);
                innerContainer.appendChild(closeButton);
                dialogBox.appendChild(innerContainer);
                flexContainer.appendChild(dialogBox);
                dc.appendChild(flexContainer);
                parentDiv.insertBefore(dc, parentDiv.firstChild);
            }
            PopupDialog.prototype.setContent = function (content) {
                this.contentContainer.innerHTML = '';
                this.contentContainer.appendChild(content);
                this.updateDialogPosition();
            };
            PopupDialog.prototype.show = function () {
                this.dialogContainer.style.display = 'block';
                this.dialogBox.focus();
            };
            PopupDialog.prototype.hide = function (triggerOnClose) {
                if (triggerOnClose === void 0) { triggerOnClose = true; }
                var _a;
                this.dialogContainer.style.display = 'none';
                if (triggerOnClose && ((_a = this.options) === null || _a === void 0 ? void 0 : _a.onClose)) {
                    this.options.onClose();
                }
            };
            PopupDialog.prototype.destroy = function () {
                this.dialogContainer.remove();
            };
            PopupDialog.prototype.updateDialogPosition = function () {
                // In order to get dimensions we need to show the dialog.
                // This will not be visible to the end user, as the browser
                // will not repaint while JS is running synchronously.
                this.show();
                var parentHeight = this.parentDiv.clientHeight + 'px';
                this.hide(false);
                this.flexContainer.style.height = parentHeight;
                if (!this.useFlex) {
                    this.flexContainer.style.lineHeight = parentHeight;
                }
            };
            PopupDialog.prototype.addDialogStyle = function () {
                var setElementStyle = function (el,
                                    styles) {
                                        el.style.cssText = styles.join(';');
                };
                setElementStyle(this.dialogContainer, [
                    'display: none',
                    'position: relative',
                    'z-index: 9999'
                ]);
                setElementStyle(this.flexContainer, [
                    'position: absolute',
                    'left: 0',
                    'right: 0'
                ].concat(this.useFlex ? [
                    'display: flex',
                    'justify-content: center',
                    'align-items: center'
                ] : [
                    'text-align: center',
                    'vertical-align: middle'
                ]));
                setElementStyle(this.dialogBox, [
                    'outline: none',
                    'background-color: #fff',
                    'box-shadow: 0 0 10px rgba(0, 0, 0, 0.5)'
                ].concat(this.useFlex ? [] : [
                    'display: inline-block',
                    'line-height: initial'
                ]));
                setElementStyle(this.innerContainer, [
                    'position: relative',
                    'padding: 15px'
                ]);
                setElementStyle(this.closeButton, [
                    'position: absolute',
                    'right: 10px',
                    'top: 10px',
                    'background: none',
                    'border: none',
                    'padding: 0',
                    'cursor: pointer'
                ]);
            };
            PopupDialog.prototype.getCloseButtonContent = function () {
                return '<svg width="20" height="20" viewBox="0 0 120 120">' +
                    '<path stroke="#4B4B4D" stroke-width="9" stroke-linecap="round"' +
                    'd="M14,14 L106,106 M106,14 L14,106"/></svg>';
            };
            return PopupDialog;
        }());

        return PopupDialog;
    });
    _registerModule(_modules, 'modules/data-filter/DataFilterDialog.js', [_modules['parts/Globals.js'], _modules['modules/data-filter/PopupDialog.js'], _modules['modules/data-filter/DataFilter.js']], function (H, PopupDialog, DataFilter) {
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
        var doc = H.doc;
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
                var _a,
                                    _b;
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
                var filter = new DataFilter(key,
                                    predicate,
                                    argument, {
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

        return DataFilterDialog;
    });
    _registerModule(_modules, 'modules/data-filter/options.js', [], function () {
        /* *
         *
         *  (c) 2009-2020 Øystein Moseng
         *
         *  DataFilter dialog options. Merged with default chart options.
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var options = {
                                dataFilter: {
                                    enabled: true,
                                    keys: null,
                                    predicates: ['contains', 'equals', 'startsWith', 'lessThan', 'greaterThan', 'hasValue'],
                                    showTotalPoints: true,
                                    caseSensitive: false
                                }
                            };

        return options;
    });
    _registerModule(_modules, 'modules/data-filter/langOptions.js', [], function () {
        /* *
         *
         *  (c) 2009-2020 Øystein Moseng
         *
         *  Default lang/i18n options for data filter module.
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var langOptions = {
                                dataFilter: {
                                    dataFilterButtonText: 'Filter data. {chartTitle}'
                                },
                                filterDataMenuText: 'Filter data'
                            };

        return langOptions;
    });
    _registerModule(_modules, 'modules/data-filter/data-filter.js', [_modules['parts/Globals.js'], _modules['modules/data-filter/DataFilter.js'], _modules['modules/data-filter/DataFilterDialog.js'], _modules['modules/data-filter/options.js'], _modules['modules/data-filter/langOptions.js'], _modules['parts/Utilities.js']], function (H, _DataFilter, DataFilterDialog, defaultOptions, defaultLangOptions, U) {
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
        /* eslint-disable no-invalid-this, valid-jsdoc */
        var addEvent = U.addEvent,
                            extend = U.extend,
                            merge = U.merge;
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
            var dialog = this.dataFilterDialog = this.dataFilterDialog || new DataFilterDialog(this,
                                dialogOptions);
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
                var visiblePointsInSeries = series.points.reduce(function (seriesTotal,
                                    point) {
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

    });
    _registerModule(_modules, 'masters/modules/data-filter.src.js', [], function () {



    });
}));