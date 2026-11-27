# TODO

Open issues. The issues found during the stack migration (Vue 3, Vite, Pinia,
Highcharts 13, Grid Pro 3) were fixed in v1.2.1, apart from the ones below.

## Release and hosting

- [ ] **Set `VITE_GRID_KEY` for release builds.** Without a Grid Key, Grid Pro
  logs an error on hosts like GitHub Pages; `sonification.highcharts.com` is
  exempt. See the README. v1.2.0 and v1.2.1 were released without one.

## When upstream fixes land

Workarounds for Highcharts 13.1.1 and Grid Pro 3.2.0, to remove once they are
fixed upstream:

- [ ] **Remove the `aria-rowindex` workaround** in
  `src/app/editor/core/gridProSetup.ts` once Grid Pro numbers screen-reader
  rows by data position again, and stops counting the rows two ways
  (2000 versus 2002 with header rows).
- [ ] **Grid Pro's keyboard navigation and labels** (`gridProSetup.ts` and
  `getGridOptions` in `src/app/editor/core/utils/gridData.ts`): Page Up and
  Down, Home and End, and Ctrl+Home and End in the body cells, a name for the
  cell editor's input, and the CSV header as the label of its header cell
  (Grid Pro labels it with the column id).
- [ ] **The playback handoff** in `ChartBridge.ts`
  (`getTimelineUpdateHookOptions`), once Highcharts keeps playback going when
  it rebuilds the sonification timeline on a render. It uses the timeline's
  internals (`resumeFromTime`, `playingChannels`, `onEndArgument`).
- [ ] **`destroyedFocusElementPlugin`** in
  `src/app/editor/core/utils/chartUtils.ts`, once the accessibility module
  stops drawing the focus border around a destroyed element on resize.
- [ ] **`plainTextAriaLabelPlugin`** in `chartUtils.ts`, and its copy in the
  exported HTML (`getHTMLChartConfig` in `ChartBridge.ts`), once the
  accessibility module decodes HTML entities in the aria-labels it sets.

## Found while fixing the migration issues

These happen in v1.2.0 too.

- [ ] **The Highcharts data module turns "/" into "-" in CSV values that
  `Date.parse` accepts**, which in Chrome includes text that ends in a number:
  a header `Speed km/h 2` gives the series name `Speed km-h 2`.
- [ ] **The settings type switch emits its click twice** (`SETabSwitch.vue`:
  the button's click, then `SETablist`'s activation clicks it again).
  Harmless, because selecting the same tab twice does nothing more.
