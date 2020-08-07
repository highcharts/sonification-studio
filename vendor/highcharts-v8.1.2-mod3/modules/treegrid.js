/*
 Highcharts Gantt JS v8.1.2 (2020-07-15)

 Tree Grid

 (c) 2016-2019 Jon Arild Nygard

 License: www.highcharts.com/license
*/
(function(a){"object"===typeof module&&module.exports?(a["default"]=a,module.exports=a):"function"===typeof define&&define.amd?define("highcharts/modules/treegrid",["highcharts"],function(A){a(A);a.Highcharts=A;return a}):a("undefined"!==typeof Highcharts?Highcharts:void 0)})(function(a){function A(a,v,w,G){a.hasOwnProperty(v)||(a[v]=G.apply(null,w))}a=a?a._modules:{};A(a,"Gantt/Tree.js",[a["Core/Utilities.js"]],function(a){var v=a.extend,w=a.isNumber,B=a.pick,h=function(a,m){var q=a.reduce(function(f,
q){var a=B(q.parent,"");"undefined"===typeof f[a]&&(f[a]=[]);f[a].push(q);return f},{});Object.keys(q).forEach(function(f,a){var p=q[f];""!==f&&-1===m.indexOf(f)&&(p.forEach(function(f){a[""].push(f)}),delete a[f])});return q},r=function(a,m,q,f,h,p){var y=0,l=0,z=p&&p.after,d=p&&p.before;m={data:f,depth:q-1,id:a,level:q,parent:m};var c,g;"function"===typeof d&&d(m,p);d=(h[a]||[]).map(function(d){var b=r(d.id,a,q+1,d,h,p),e=d.start;d=!0===d.milestone?e:d.end;c=!w(c)||e<c?e:c;g=!w(g)||d>g?d:g;y=y+
1+b.descendants;l=Math.max(b.height+1,l);return b});f&&(f.start=B(f.start,c),f.end=B(f.end,g));v(m,{children:d,descendants:y,height:l});"function"===typeof z&&z(m,p);return m};return{getListOfParents:h,getNode:r,getTree:function(a,m){var q=a.map(function(f){return f.id});a=h(a,q);return r("",null,1,null,a,m)}}});A(a,"Core/Axis/TreeGridTick.js",[a["Core/Utilities.js"]],function(a){var v=a.addEvent,w=a.defined,B=a.isObject,h=a.isNumber,r=a.pick,x=a.wrap,m;(function(a){function f(){this.treeGrid||(this.treeGrid=
new z(this))}function q(d,c){d=d.treeGrid;var g=!d.labelIcon,n=c.renderer,b=c.xy,e=c.options,k=e.width,C=e.height,F=b.x-k/2-e.padding;b=b.y-C/2;var a=c.collapsed?90:180,f=c.show&&h(b),l=d.labelIcon;l||(d.labelIcon=l=n.path(n.symbols[e.type](e.x,e.y,k,C)).addClass("highcharts-label-icon").add(c.group));f||l.attr({y:-9999});n.styledMode||l.attr({"stroke-width":1,fill:r(c.color,"#666666")}).css({cursor:"pointer",stroke:e.lineColor,strokeWidth:e.lineWidth});l[g?"attr":"animate"]({translateX:F,translateY:b,
rotation:a})}function m(d,c,g,n,b,e,k,C,F){var a=r(this.options&&this.options.labels,e);e=this.pos;var f=this.axis,l="treegrid"===f.options.type;d=d.apply(this,[c,g,n,b,a,k,C,F]);l&&(c=a&&B(a.symbol,!0)?a.symbol:{},a=a&&h(a.indentation)?a.indentation:0,e=(e=(f=f.treeGrid.mapOfPosToGridNode)&&f[e])&&e.depth||1,d.x+=c.width+2*c.padding+(e-1)*a);return d}function y(d){var c=this,g=c.pos,a=c.axis,b=c.label,e=a.treeGrid.mapOfPosToGridNode,k=a.options,C=r(c.options&&c.options.labels,k&&k.labels),F=C&&B(C.symbol,
!0)?C.symbol:{},f=(e=e&&e[g])&&e.depth;k="treegrid"===k.type;var l=-1<a.tickPositions.indexOf(g);g=a.chart.styledMode;k&&e&&b&&b.element&&b.addClass("highcharts-treegrid-node-level-"+f);d.apply(c,Array.prototype.slice.call(arguments,1));k&&b&&b.element&&e&&e.descendants&&0<e.descendants&&(a=a.treeGrid.isCollapsed(e),q(c,{color:!g&&b.styles&&b.styles.color||"",collapsed:a,group:b.parentGroup,options:F,renderer:b.renderer,show:l,xy:b.xy}),F="highcharts-treegrid-node-"+(a?"expanded":"collapsed"),b.addClass("highcharts-treegrid-node-"+
(a?"collapsed":"expanded")).removeClass(F),g||b.css({cursor:"pointer"}),[b,c.treeGrid.labelIcon].forEach(function(e){e&&!e.attachedTreeGridEvents&&(v(e.element,"mouseover",function(){b.addClass("highcharts-treegrid-node-active");b.renderer.styledMode||b.css({textDecoration:"underline"})}),v(e.element,"mouseout",function(){var e=w(C.style)?C.style:{};b.removeClass("highcharts-treegrid-node-active");b.renderer.styledMode||b.css({textDecoration:e.textDecoration})}),v(e.element,"click",function(){c.treeGrid.toggleCollapse()}),
e.attachedTreeGridEvents=!0)}))}var l=!1;a.compose=function(d){l||(v(d,"init",f),x(d.prototype,"getLabelPosition",m),x(d.prototype,"renderLabel",y),d.prototype.collapse=function(c){this.treeGrid.collapse(c)},d.prototype.expand=function(c){this.treeGrid.expand(c)},d.prototype.toggleCollapse=function(c){this.treeGrid.toggleCollapse(c)},l=!0)};var z=function(){function d(c){this.tick=c}d.prototype.collapse=function(c){var d=this.tick,a=d.axis,b=a.brokenAxis;b&&a.treeGrid.mapOfPosToGridNode&&(d=a.treeGrid.collapse(a.treeGrid.mapOfPosToGridNode[d.pos]),
b.setBreaks(d,r(c,!0)))};d.prototype.expand=function(c){var d=this.tick,a=d.axis,b=a.brokenAxis;b&&a.treeGrid.mapOfPosToGridNode&&(d=a.treeGrid.expand(a.treeGrid.mapOfPosToGridNode[d.pos]),b.setBreaks(d,r(c,!0)))};d.prototype.toggleCollapse=function(c){var d=this.tick,a=d.axis,b=a.brokenAxis;b&&a.treeGrid.mapOfPosToGridNode&&(d=a.treeGrid.toggleCollapse(a.treeGrid.mapOfPosToGridNode[d.pos]),b.setBreaks(d,r(c,!0)))};return d}();a.Additions=z})(m||(m={}));return m});A(a,"mixins/tree-series.js",[a["Core/Color.js"],
a["Core/Utilities.js"]],function(a,v){var w=v.extend,B=v.isArray,h=v.isNumber,r=v.isObject,x=v.merge,m=v.pick;return{getColor:function(q,f){var h=f.index,p=f.mapOptionsToLevel,y=f.parentColor,l=f.parentColorIndex,z=f.series,d=f.colors,c=f.siblings,g=z.points,n=z.chart.options.chart,b;if(q){g=g[q.i];q=p[q.level]||{};if(p=g&&q.colorByPoint){var e=g.index%(d?d.length:n.colorCount);var k=d&&d[e]}if(!z.chart.styledMode){d=g&&g.options.color;n=q&&q.color;if(b=y)b=(b=q&&q.colorVariation)&&"brightness"===
b.key?a.parse(y).brighten(h/c*b.to).get():y;b=m(d,n,k,b,z.color)}var C=m(g&&g.options.colorIndex,q&&q.colorIndex,e,l,f.colorIndex)}return{color:b,colorIndex:C}},getLevelOptions:function(a){var f=null;if(r(a)){f={};var m=h(a.from)?a.from:1;var p=a.levels;var y={};var l=r(a.defaults)?a.defaults:{};B(p)&&(y=p.reduce(function(a,d){if(r(d)&&h(d.level)){var c=x({},d);var f="boolean"===typeof c.levelIsConstant?c.levelIsConstant:l.levelIsConstant;delete c.levelIsConstant;delete c.level;d=d.level+(f?0:m-1);
r(a[d])?w(a[d],c):a[d]=c}return a},{}));p=h(a.to)?a.to:1;for(a=0;a<=p;a++)f[a]=x({},l,r(y[a])?y[a]:{})}return f},setTreeValues:function p(a,h){var f=h.before,l=h.idRoot,z=h.mapIdToNode[l],d=h.points[a.i],c=d&&d.options||{},g=0,n=[];w(a,{levelDynamic:a.level-(("boolean"===typeof h.levelIsConstant?h.levelIsConstant:1)?0:z.level),name:m(d&&d.name,""),visible:l===a.id||("boolean"===typeof h.visible?h.visible:!1)});"function"===typeof f&&(a=f(a,h));a.children.forEach(function(b,e){var k=w({},h);w(k,{index:e,
siblings:a.children.length,visible:a.visible});b=p(b,k);n.push(b);b.visible&&(g+=b.val)});a.visible=0<g||a.visible;f=m(c.value,g);w(a,{children:n,childrenTotal:g,isLeaf:a.visible&&!g,val:f});return a},updateRootId:function(a){if(r(a)){var f=r(a.options)?a.options:{};f=m(a.rootNode,f.rootId,"");r(a.userOptions)&&(a.userOptions.rootId=f);a.rootNode=f}return f}}});A(a,"Core/Axis/GridAxis.js",[a["Core/Axis/Axis.js"],a["Core/Globals.js"],a["Core/Options.js"],a["Core/Axis/Tick.js"],a["Core/Utilities.js"]],
function(a,v,w,A,h){var r=w.dateFormat,x=h.addEvent,m=h.defined,q=h.erase,f=h.find,B=h.isArray,p=h.isNumber,y=h.merge,l=h.pick,z=h.timeUnits,d=h.wrap;w=v.Chart;var c=function(b){var e=b.options;e.labels||(e.labels={});e.labels.align=l(e.labels.align,"center");b.categories||(e.showLastLabel=!1);b.labelRotation=0;e.labels.rotation=0};"";a.prototype.getMaxLabelDimensions=function(b,e){var a={width:0,height:0};e.forEach(function(e){e=b[e];if(h.isObject(e,!0)){var k=h.isObject(e.label,!0)?e.label:{};e=
k.getBBox?k.getBBox().height:0;k.textStr&&!p(k.textPxLength)&&(k.textPxLength=k.getBBox().width);k=p(k.textPxLength)?Math.round(k.textPxLength):0;a.height=Math.max(e,a.height);a.width=Math.max(k,a.width)}});return a};v.dateFormats.W=function(a){a=new this.Date(a);var e=(this.get("Day",a)+6)%7,b=new this.Date(a.valueOf());this.set("Date",b,this.get("Date",a)-e+3);e=new this.Date(this.get("FullYear",b),0,1);4!==this.get("Day",e)&&(this.set("Month",a,0),this.set("Date",a,1+(11-this.get("Day",e))%7));
return(1+Math.floor((b.valueOf()-e.valueOf())/6048E5)).toString()};v.dateFormats.E=function(a){return r("%a",a,!0).charAt(0)};x(w,"afterSetChartSize",function(){this.axes.forEach(function(a){(a.grid&&a.grid.columns||[]).forEach(function(e){e.setAxisSize();e.setAxisTranslation()})})});x(A,"afterGetLabelPosition",function(a){var e=this.label,k=this.axis,b=k.reversed,c=k.chart,d=k.options.grid||{},g=k.options.labels,l=g.align,u=n.Side[k.side],t=a.tickmarkOffset,E=k.tickPositions,D=this.pos-t;E=p(E[a.index+
1])?E[a.index+1]-t:k.max+t;var f=k.tickSize("tick");t=f?f[0]:0;f=f?f[1]/2:0;if(!0===d.enabled){if("top"===u){d=k.top+k.offset;var h=d-t}else"bottom"===u?(h=c.chartHeight-k.bottom+k.offset,d=h+t):(d=k.top+k.len-k.translate(b?E:D),h=k.top+k.len-k.translate(b?D:E));"right"===u?(u=c.chartWidth-k.right+k.offset,b=u+t):"left"===u?(b=k.left+k.offset,u=b-t):(u=Math.round(k.left+k.translate(b?E:D))-f,b=Math.round(k.left+k.translate(b?D:E))-f);this.slotWidth=b-u;a.pos.x="left"===l?u:"right"===l?b:u+(b-u)/2;
a.pos.y=h+(d-h)/2;c=c.renderer.fontMetrics(g.style.fontSize,e.element);e=e.getBBox().height;g.useHTML?a.pos.y+=c.b+-(e/2):(e=Math.round(e/c.h),a.pos.y+=(c.b-(c.h-c.f))/2+-((e-1)*c.h/2));a.pos.x+=k.horiz&&g.x||0}});var g=function(){function a(a){this.axis=a}a.prototype.isOuterAxis=function(){var a=this.axis,b=a.grid.columnIndex,c=a.linkedParent&&a.linkedParent.grid.columns||a.grid.columns,d=b?a.linkedParent:a,g=-1,f=0;a.chart[a.coll].forEach(function(e,b){e.side!==a.side||e.options.isInternal||(f=
b,e===d&&(g=b))});return f===g&&(p(b)?c.length===b:!0)};return a}(),n=function(){function b(){}b.compose=function(e){a.keepProps.push("grid");d(e.prototype,"unsquish",b.wrapUnsquish);x(e,"init",b.onInit);x(e,"afterGetOffset",b.onAfterGetOffset);x(e,"afterGetTitlePosition",b.onAfterGetTitlePosition);x(e,"afterInit",b.onAfterInit);x(e,"afterRender",b.onAfterRender);x(e,"afterSetAxisTranslation",b.onAfterSetAxisTranslation);x(e,"afterSetOptions",b.onAfterSetOptions);x(e,"afterSetOptions",b.onAfterSetOptions2);
x(e,"afterSetScale",b.onAfterSetScale);x(e,"afterTickSize",b.onAfterTickSize);x(e,"trimTicks",b.onTrimTicks);x(e,"destroy",b.onDestroy)};b.onAfterGetOffset=function(){var a=this.grid;(a&&a.columns||[]).forEach(function(a){a.getOffset()})};b.onAfterGetTitlePosition=function(a){if(!0===(this.options.grid||{}).enabled){var e=this.axisTitle,c=this.height,d=this.horiz,g=this.left,f=this.offset,h=this.opposite,u=this.options.title,t=void 0===u?{}:u;u=this.top;var E=this.width,D=this.tickSize(),n=e&&e.getBBox().width,
z=t.x||0,m=t.y||0,y=l(t.margin,d?5:10);e=this.chart.renderer.fontMetrics(t.style&&t.style.fontSize,e).f;D=(d?u+c:g)+(d?1:-1)*(h?-1:1)*(D?D[0]/2:0)+(this.side===b.Side.bottom?e:0);a.titlePosition.x=d?g-n/2-y+z:D+(h?E:0)+f+z;a.titlePosition.y=d?D-(h?c:0)+(h?e:-e)/2+f+m:u-y+m}};b.onAfterInit=function(){var e=this.chart,b=this.options.grid;b=void 0===b?{}:b;var g=this.userOptions;b.enabled&&(c(this),d(this,"labelFormatter",function(a){var e=this.axis,b=this.value,c=e.tickPositions,d=(e.isLinked?e.linkedParent:
e).series[0],k=b===c[0];c=b===c[c.length-1];d=d&&f(d.options.data,function(a){return a[e.isXAxis?"x":"y"]===b});this.isFirst=k;this.isLast=c;this.point=d;return a.call(this)}));if(b.columns)for(var l=this.grid.columns=[],h=this.grid.columnIndex=0;++h<b.columns.length;){var n=y(g,b.columns[b.columns.length-h-1],{linkedTo:0,type:"category"});delete n.grid.columns;n=new a(this.chart,n);n.grid.isColumn=!0;n.grid.columnIndex=h;q(e.axes,n);q(e[this.coll],n);l.push(n)}};b.onAfterRender=function(){var a=
this.grid,c=this.options,d=this.chart.renderer;if(!0===(c.grid||{}).enabled){this.maxLabelDimensions=this.getMaxLabelDimensions(this.ticks,this.tickPositions);this.rightWall&&this.rightWall.destroy();if(this.grid&&this.grid.isOuterAxis()&&this.axisLine){var g=c.lineWidth;if(g){var f=this.getLinePath(g),l=f[0],n=f[1],u=((this.tickSize("tick")||[1])[0]-1)*(this.side===b.Side.top||this.side===b.Side.left?-1:1);"M"===l[0]&&"L"===n[0]&&(this.horiz?(l[2]+=u,n[2]+=u):(l[1]+=u,n[1]+=u));this.grid.axisLineExtra?
this.grid.axisLineExtra.animate({d:f}):(this.grid.axisLineExtra=d.path(f).attr({zIndex:7}).addClass("highcharts-axis-line").add(this.axisGroup),d.styledMode||this.grid.axisLineExtra.attr({stroke:c.lineColor,"stroke-width":g}));this.axisLine[this.showAxis?"show":"hide"](!0)}}(a&&a.columns||[]).forEach(function(a){a.render()})}};b.onAfterSetAxisTranslation=function(){var a=this.tickPositions&&this.tickPositions.info,b=this.options,c=b.grid||{},d=this.userOptions.labels||{};this.horiz&&(!0===c.enabled&&
this.series.forEach(function(a){a.options.pointRange=0}),a&&b.dateTimeLabelFormats&&b.labels&&!m(d.align)&&(!1===b.dateTimeLabelFormats[a.unitName].range||1<a.count)&&(b.labels.align="left",m(d.x)||(b.labels.x=3)))};b.onAfterSetOptions=function(a){var b=this.options;a=a.userOptions;var e=b&&h.isObject(b.grid,!0)?b.grid:{};if(!0===e.enabled){var c=y(!0,{className:"highcharts-grid-axis "+(a.className||""),dateTimeLabelFormats:{hour:{list:["%H:%M","%H"]},day:{list:["%A, %e. %B","%a, %e. %b","%E"]},week:{list:["Week %W",
"W%W"]},month:{list:["%B","%b","%o"]}},grid:{borderWidth:1},labels:{padding:2,style:{fontSize:"13px"}},margin:0,title:{text:null,reserveSpace:!1,rotation:0},units:[["millisecond",[1,10,100]],["second",[1,10]],["minute",[1,5,15]],["hour",[1,6]],["day",[1]],["week",[1]],["month",[1]],["year",null]]},a);"xAxis"===this.coll&&(m(a.linkedTo)&&!m(a.tickPixelInterval)&&(c.tickPixelInterval=350),m(a.tickPixelInterval)||!m(a.linkedTo)||m(a.tickPositioner)||m(a.tickInterval)||(c.tickPositioner=function(a,b){var e=
this.linkedParent&&this.linkedParent.tickPositions&&this.linkedParent.tickPositions.info;if(e){var d,k=c.units;for(d=0;d<k.length;d++)if(k[d][0]===e.unitName){var g=d;break}if(k[g+1]){var f=k[g+1][0];var l=(k[g+1][1]||[1])[0]}else"year"===e.unitName&&(f="year",l=10*e.count);e=z[f];this.tickInterval=e*l;return this.getTimeTicks({unitRange:e,count:l,unitName:f},a,b,this.options.startOfWeek)}}));y(!0,this.options,c);this.horiz&&(b.minPadding=l(a.minPadding,0),b.maxPadding=l(a.maxPadding,0));p(b.grid.borderWidth)&&
(b.tickWidth=b.lineWidth=e.borderWidth)}};b.onAfterSetOptions2=function(a){a=(a=a.userOptions)&&a.grid||{};var b=a.columns;a.enabled&&b&&y(!0,this.options,b[b.length-1])};b.onAfterSetScale=function(){(this.grid.columns||[]).forEach(function(a){a.setScale()})};b.onAfterTickSize=function(b){var c=a.defaultLeftAxisOptions,e=this.horiz,d=this.maxLabelDimensions,g=this.options.grid;g=void 0===g?{}:g;g.enabled&&d&&(c=2*Math.abs(c.labels.x),e=e?g.cellHeight||c+d.height:c+d.width,B(b.tickSize)?b.tickSize[0]=
e:b.tickSize=[e,0])};b.onDestroy=function(a){var b=this.grid;(b.columns||[]).forEach(function(b){b.destroy(a.keepEvents)});b.columns=void 0};b.onInit=function(a){a=a.userOptions||{};var b=a.grid||{};b.enabled&&m(b.borderColor)&&(a.tickColor=a.lineColor=b.borderColor);this.grid||(this.grid=new g(this))};b.onTrimTicks=function(){var a=this.options,b=this.categories,c=this.tickPositions,d=c[0],g=c[c.length-1],f=this.linkedParent&&this.linkedParent.min||this.min,l=this.linkedParent&&this.linkedParent.max||
this.max,u=this.tickInterval;!0!==(a.grid||{}).enabled||b||!this.horiz&&!this.isLinked||(d<f&&d+u>f&&!a.startOnTick&&(c[0]=f),g>l&&g-u<l&&!a.endOnTick&&(c[c.length-1]=l))};b.wrapUnsquish=function(a){var b=this.options.grid;return!0===(void 0===b?{}:b).enabled&&this.categories?this.tickInterval:a.apply(this,Array.prototype.slice.call(arguments,1))};return b}();(function(a){a=a.Side||(a.Side={});a[a.top=0]="top";a[a.right=1]="right";a[a.bottom=2]="bottom";a[a.left=3]="left"})(n||(n={}));n.compose(a);
return n});A(a,"Core/Axis/BrokenAxis.js",[a["Core/Axis/Axis.js"],a["Core/Globals.js"],a["Core/Utilities.js"],a["Extensions/Stacking.js"]],function(a,v,w,A){var h=w.addEvent,r=w.find,x=w.fireEvent,m=w.isArray,q=w.isNumber,f=w.pick,B=v.Series,p=function(){function h(a){this.hasBreaks=!1;this.axis=a}h.isInBreak=function(a,f){var d=a.repeat||Infinity,c=a.from,g=a.to-a.from;f=f>=c?(f-c)%d:d-(c-f)%d;return a.inclusive?f<=g:f<g&&0!==f};h.lin2Val=function(a){var f=this.brokenAxis;f=f&&f.breakArray;if(!f)return a;
var d;for(d=0;d<f.length;d++){var c=f[d];if(c.from>=a)break;else c.to<a?a+=c.len:h.isInBreak(c,a)&&(a+=c.len)}return a};h.val2Lin=function(a){var f=this.brokenAxis;f=f&&f.breakArray;if(!f)return a;var d=a,c;for(c=0;c<f.length;c++){var g=f[c];if(g.to<=a)d-=g.len;else if(g.from>=a)break;else if(h.isInBreak(g,a)){d-=a-g.from;break}}return d};h.prototype.findBreakAt=function(a,f){return r(f,function(d){return d.from<a&&a<d.to})};h.prototype.isInAnyBreak=function(a,m){var d=this.axis,c=d.options.breaks,
g=c&&c.length,n;if(g){for(;g--;)if(h.isInBreak(c[g],a)){var b=!0;n||(n=f(c[g].showPoints,!d.isXAxis))}var e=b&&m?b&&!n:b}return e};h.prototype.setBreaks=function(l,p){var d=this,c=d.axis,g=m(l)&&!!l.length;c.isDirty=d.hasBreaks!==g;d.hasBreaks=g;c.options.breaks=c.userOptions.breaks=l;c.forceRedraw=!0;c.series.forEach(function(a){a.isDirty=!0});g||c.val2lin!==h.val2Lin||(delete c.val2lin,delete c.lin2val);g&&(c.userOptions.ordinal=!1,c.lin2val=h.lin2Val,c.val2lin=h.val2Lin,c.setExtremes=function(c,
b,e,f,g){if(d.hasBreaks){for(var k,h=this.options.breaks;k=d.findBreakAt(c,h);)c=k.to;for(;k=d.findBreakAt(b,h);)b=k.from;b<c&&(b=c)}a.prototype.setExtremes.call(this,c,b,e,f,g)},c.setAxisTranslation=function(g){a.prototype.setAxisTranslation.call(this,g);d.unitLength=null;if(d.hasBreaks){g=c.options.breaks||[];var b=[],e=[],k=0,l,n=c.userMin||c.min,m=c.userMax||c.max,p=f(c.pointRangePadding,0),q;g.forEach(function(a){l=a.repeat||Infinity;h.isInBreak(a,n)&&(n+=a.to%l-n%l);h.isInBreak(a,m)&&(m-=m%
l-a.from%l)});g.forEach(function(a){t=a.from;for(l=a.repeat||Infinity;t-l>n;)t-=l;for(;t<n;)t+=l;for(q=t;q<m;q+=l)b.push({value:q,move:"in"}),b.push({value:q+(a.to-a.from),move:"out",size:a.breakSize})});b.sort(function(a,b){return a.value===b.value?("in"===a.move?0:1)-("in"===b.move?0:1):a.value-b.value});var u=0;var t=n;b.forEach(function(a){u+="in"===a.move?1:-1;1===u&&"in"===a.move&&(t=a.value);0===u&&(e.push({from:t,to:a.value,len:a.value-t-(a.size||0)}),k+=a.value-t-(a.size||0))});c.breakArray=
d.breakArray=e;d.unitLength=m-n-k+p;x(c,"afterBreaks");c.staticScale?c.transA=c.staticScale:d.unitLength&&(c.transA*=(m-c.min+p)/d.unitLength);p&&(c.minPixelPadding=c.transA*c.minPointOffset);c.min=n;c.max=m}});f(p,!0)&&c.chart.redraw()};return h}();v=function(){function a(){}a.compose=function(a,m){a.keepProps.push("brokenAxis");var d=B.prototype;d.drawBreaks=function(a,d){var c=this,b=c.points,e,g,h,l;if(a&&a.brokenAxis&&a.brokenAxis.hasBreaks){var m=a.brokenAxis;d.forEach(function(d){e=m&&m.breakArray||
[];g=a.isXAxis?a.min:f(c.options.threshold,a.min);b.forEach(function(b){l=f(b["stack"+d.toUpperCase()],b[d]);e.forEach(function(c){if(q(g)&&q(l)){h=!1;if(g<c.from&&l>c.to||g>c.from&&l<c.from)h="pointBreak";else if(g<c.from&&l>c.from&&l<c.to||g>c.from&&l>c.to&&l<c.from)h="pointInBreak";h&&x(a,h,{point:b,brk:c})}})})})}};d.gappedPath=function(){var a=this.currentDataGrouping,d=a&&a.gapSize;a=this.options.gapSize;var f=this.points.slice(),b=f.length-1,e=this.yAxis,k;if(a&&0<b)for("value"!==this.options.gapUnit&&
(a*=this.basePointRange),d&&d>a&&d>=this.basePointRange&&(a=d),k=void 0;b--;)k&&!1!==k.visible||(k=f[b+1]),d=f[b],!1!==k.visible&&!1!==d.visible&&(k.x-d.x>a&&(k=(d.x+k.x)/2,f.splice(b+1,0,{isNull:!0,x:k}),e.stacking&&this.options.stacking&&(k=e.stacking.stacks[this.stackKey][k]=new A(e,e.options.stackLabels,!1,k,this.stack),k.total=0)),k=d);return this.getGraphPath(f)};h(a,"init",function(){this.brokenAxis||(this.brokenAxis=new p(this))});h(a,"afterInit",function(){"undefined"!==typeof this.brokenAxis&&
this.brokenAxis.setBreaks(this.options.breaks,!1)});h(a,"afterSetTickPositions",function(){var a=this.brokenAxis;if(a&&a.hasBreaks){var d=this.tickPositions,f=this.tickPositions.info,b=[],e;for(e=0;e<d.length;e++)a.isInAnyBreak(d[e])||b.push(d[e]);this.tickPositions=b;this.tickPositions.info=f}});h(a,"afterSetOptions",function(){this.brokenAxis&&this.brokenAxis.hasBreaks&&(this.options.ordinal=!1)});h(m,"afterGeneratePoints",function(){var a=this.options.connectNulls,d=this.points,f=this.xAxis,b=
this.yAxis;if(this.isDirty)for(var e=d.length;e--;){var k=d[e],h=!(null===k.y&&!1===a)&&(f&&f.brokenAxis&&f.brokenAxis.isInAnyBreak(k.x,!0)||b&&b.brokenAxis&&b.brokenAxis.isInAnyBreak(k.y,!0));k.visible=h?!1:!1!==k.options.visible}});h(m,"afterRender",function(){this.drawBreaks(this.xAxis,["x"]);this.drawBreaks(this.yAxis,f(this.pointArrayMap,["y"]))})};return a}();v.compose(a,B);return v});A(a,"Core/Axis/TreeGridAxis.js",[a["Core/Axis/Axis.js"],a["Core/Axis/Tick.js"],a["Gantt/Tree.js"],a["Core/Axis/TreeGridTick.js"],
a["mixins/tree-series.js"],a["Core/Utilities.js"]],function(a,v,w,A,h,r){var x=h.getLevelOptions,m=r.addEvent,q=r.find,f=r.fireEvent,B=r.isNumber,p=r.isObject,y=r.isString,l=r.merge,z=r.pick,d=r.wrap,c;(function(a){function c(a,b){var c=a.collapseStart||0;a=a.collapseEnd||0;a>=b&&(c-=.5);return{from:c,to:a,showPoints:!1}}function b(a,b,c){var d=[],e=[],f={},g={},h=-1,k="boolean"===typeof b?b:!1;a=w.getTree(a,{after:function(a){a=g[a.pos];var b=0,c=0;a.children.forEach(function(a){c+=(a.descendants||
0)+1;b=Math.max((a.height||0)+1,b)});a.descendants=c;a.height=b;a.collapsed&&e.push(a)},before:function(a){var b=p(a.data,!0)?a.data:{},c=y(b.name)?b.name:"",e=f[a.parent];e=p(e,!0)?g[e.pos]:null;var t=function(a){return a.name===c},l;k&&p(e,!0)&&(l=q(e.children,t))?(t=l.pos,l.nodes.push(a)):t=h++;g[t]||(g[t]=l={depth:e?e.depth+1:0,name:c,nodes:[a],children:[],pos:t},-1!==t&&d.push(c),p(e,!0)&&e.children.push(l));y(a.id)&&(f[a.id]=a);l&&!0===b.collapsed&&(l.collapsed=!0);a.pos=t}});g=function(a,b){var c=
function(a,d,e){var f=d+(-1===d?0:b-1),g=(f-d)/2,h=d+g;a.nodes.forEach(function(a){var b=a.data;p(b,!0)&&(b.y=d+(b.seriesIndex||0),delete b.seriesIndex);a.pos=h});e[h]=a;a.pos=h;a.tickmarkOffset=g+.5;a.collapseStart=f+.5;a.children.forEach(function(a){c(a,f+1,e);f=(a.collapseEnd||0)-.5});a.collapseEnd=f+.5;return e};return c(a["-1"],-1,{})}(g,c);return{categories:d,mapOfIdToNode:f,mapOfPosToGridNode:g,collapsedNodes:e,tree:a}}function e(a){a.target.axes.filter(function(a){return"treegrid"===a.options.type}).forEach(function(c){var d=
c.options||{},e=d.labels,f=d.uniqueNames,g=0;if(!c.treeGrid.mapOfPosToGridNode||c.series.some(function(a){return!a.hasRendered||a.isDirtyData||a.isDirty}))d=c.series.reduce(function(a,b){b.visible&&((b.options.data||[]).forEach(function(b){p(b,!0)&&(b.seriesIndex=g,a.push(b))}),!0===f&&g++);return a},[]),d=b(d,f||!1,!0===f?g:1),c.categories=d.categories,c.treeGrid.mapOfPosToGridNode=d.mapOfPosToGridNode,c.hasNames=!0,c.treeGrid.tree=d.tree,c.series.forEach(function(a){var b=(a.options.data||[]).map(function(a){return p(a,
!0)?l(a):a});a.visible&&a.setData(b,!1)}),c.treeGrid.mapOptionsToLevel=x({defaults:e,from:1,levels:e&&e.levels,to:c.treeGrid.tree&&c.treeGrid.tree.height}),"beforeRender"===a.type&&(c.treeGrid.collapsedNodes=d.collapsedNodes)})}function g(a,b){var c=this.treeGrid.mapOptionsToLevel||{},d=this.ticks,e=d[b],f;if("treegrid"===this.options.type&&this.treeGrid.mapOfPosToGridNode){var g=this.treeGrid.mapOfPosToGridNode[b];(c=c[g.depth])&&(f={labels:c});e?(e.parameters.category=g.name,e.options=f,e.addLabel()):
d[b]=new v(this,b,void 0,void 0,{category:g.name,tickmarkOffset:g.tickmarkOffset,options:f})}else a.apply(this,Array.prototype.slice.call(arguments,1))}function h(a){var b=this.options;b=(b=b&&b.labels)&&B(b.indentation)?b.indentation:0;var c=a.apply(this,Array.prototype.slice.call(arguments,1));if("treegrid"===this.options.type&&this.treeGrid.mapOfPosToGridNode){var d=this.treeGrid.mapOfPosToGridNode[-1].height||0;c.width+=b*(d-1)}return c}function r(a,c,d){var f=this,g="treegrid"===d.type;f.treeGrid||
(f.treeGrid=new I(f));g&&(m(c,"beforeRender",e),m(c,"beforeRedraw",e),m(c,"addSeries",function(a){a.options.data&&(a=b(a.options.data,d.uniqueNames||!1,1),f.treeGrid.collapsedNodes=(f.treeGrid.collapsedNodes||[]).concat(a.collapsedNodes))}),m(f,"foundExtremes",function(){f.treeGrid.collapsedNodes&&f.treeGrid.collapsedNodes.forEach(function(a){var b=f.treeGrid.collapse(a);f.brokenAxis&&(f.brokenAxis.setBreaks(b,!1),f.treeGrid.collapsedNodes&&(f.treeGrid.collapsedNodes=f.treeGrid.collapsedNodes.filter(function(b){return a.collapseStart!==
b.collapseStart||a.collapseEnd!==b.collapseEnd})))})}),m(f,"afterBreaks",function(){var a;"yAxis"===f.coll&&!f.staticScale&&(null===(a=f.chart.options.chart)||void 0===a?0:a.height)&&(f.isDirty=!0)}),d=l({grid:{enabled:!0},labels:{align:"left",levels:[{level:void 0},{level:1,style:{fontWeight:"bold"}}],symbol:{type:"triangle",x:-5,y:-5,height:10,width:10,padding:5}},uniqueNames:!1},d,{reversed:!0,grid:{columns:void 0}}));a.apply(f,[c,d]);g&&(f.hasNames=!0,f.options.showLastLabel=!0)}function G(a){var b=
this.options;"treegrid"===b.type?(this.min=z(this.userMin,b.min,this.dataMin),this.max=z(this.userMax,b.max,this.dataMax),f(this,"foundExtremes"),this.setAxisTranslation(!0),this.tickmarkOffset=.5,this.tickInterval=1,this.tickPositions=this.treeGrid.mapOfPosToGridNode?this.treeGrid.getTickPositions():[]):a.apply(this,Array.prototype.slice.call(arguments,1))}var H=!1;a.compose=function(a){H||(d(a.prototype,"generateTick",g),d(a.prototype,"getMaxLabelDimensions",h),d(a.prototype,"init",r),d(a.prototype,
"setTickInterval",G),A.compose(v),H=!0)};var I=function(){function a(a){this.axis=a}a.prototype.collapse=function(a){var b=this.axis,d=b.options.breaks||[];a=c(a,b.max);d.push(a);return d};a.prototype.expand=function(a){var b=this.axis,d=b.options.breaks||[],e=c(a,b.max);return d.reduce(function(a,b){b.to===e.to&&b.from===e.from||a.push(b);return a},[])};a.prototype.getTickPositions=function(){var a=this.axis;return Object.keys(a.treeGrid.mapOfPosToGridNode||{}).reduce(function(b,c){c=+c;!(a.min<=
c&&a.max>=c)||a.brokenAxis&&a.brokenAxis.isInAnyBreak(c)||b.push(c);return b},[])};a.prototype.isCollapsed=function(a){var b=this.axis,d=b.options.breaks||[],e=c(a,b.max);return d.some(function(a){return a.from===e.from&&a.to===e.to})};a.prototype.toggleCollapse=function(a){return this.isCollapsed(a)?this.expand(a):this.collapse(a)};return a}();a.Additions=I})(c||(c={}));a.prototype.utils={getNode:w.getNode};c.compose(a);return c});A(a,"masters/modules/treegrid.src.js",[],function(){})});
//# sourceMappingURL=treegrid.js.map