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
import U from '../../parts/Utilities.js';
var defined = U.defined, getNestedProperty = U.getNestedProperty;
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
        var prop = getNestedProperty(this.key, point);
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
        var _a, _b;
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
export default DataFilter;
