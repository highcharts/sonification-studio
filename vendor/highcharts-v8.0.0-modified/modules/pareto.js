/*
 Highcharts JS v8.0.0 (2020-02-13)

 Pareto series type for Highcharts

 (c) 2010-2019 Sebastian Bochan

 License: www.highcharts.com/license
*/
(function(a){"object"===typeof module&&module.exports?(a["default"]=a,module.exports=a):"function"===typeof define&&define.amd?define("highcharts/modules/pareto",["highcharts"],function(b){a(b);a.Highcharts=b;return a}):a("undefined"!==typeof Highcharts?Highcharts:void 0)})(function(a){function b(a,c,e,b){a.hasOwnProperty(c)||(a[c]=b.apply(null,e))}a=a?a._modules:{};b(a,"mixins/derived-series.js",[a["parts/Globals.js"],a["parts/Utilities.js"]],function(a,c){var b=c.addEvent,f=c.defined,d=a.Series;
return{hasDerivedData:!0,init:function(){d.prototype.init.apply(this,arguments);this.initialised=!1;this.baseSeries=null;this.eventRemovers=[];this.addEvents()},setDerivedData:a.noop,setBaseSeries:function(){var a=this.chart,b=this.options.baseSeries;this.baseSeries=f(b)&&(a.series[b]||a.get(b))||null},addEvents:function(){var a=this;var c=b(this.chart,"afterLinkSeries",function(){a.setBaseSeries();a.baseSeries&&!a.initialised&&(a.setDerivedData(),a.addBaseSeriesEvents(),a.initialised=!0)});this.eventRemovers.push(c)},
addBaseSeriesEvents:function(){var a=this;var c=b(a.baseSeries,"updatedData",function(){a.setDerivedData()});var d=b(a.baseSeries,"destroy",function(){a.baseSeries=null;a.initialised=!1});a.eventRemovers.push(c,d)},destroy:function(){this.eventRemovers.forEach(function(a){a()});d.prototype.destroy.apply(this,arguments)}}});b(a,"modules/pareto.src.js",[a["parts/Globals.js"],a["parts/Utilities.js"],a["mixins/derived-series.js"]],function(a,b,e){var c=b.correctFloat;b=b.merge;a=a.seriesType;a("pareto",
"line",{zIndex:3},b(e,{setDerivedData:function(){var a=this.baseSeries.xData,b=this.baseSeries.yData,c=this.sumPointsPercents(b,a,null,!0);this.setData(this.sumPointsPercents(b,a,c,!1),!1)},sumPointsPercents:function(a,b,e,h){var d=0,k=0,l=[],g;a.forEach(function(a,f){null!==a&&(h?d+=a:(g=a/e*100,l.push([b[f],c(k+g)]),k+=g))});return h?d:l}}));""});b(a,"masters/modules/pareto.src.js",[],function(){})});
//# sourceMappingURL=pareto.js.map