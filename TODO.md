# TODO

Open issues found during the stack migration (Vue 3, Vite, Pinia,
Highcharts 13, Grid Pro 3). Each one was checked against master (v1.1.1), and
all of them happen there too, so none were caused by the migration. They were
left out of the migration on purpose, to keep its changes reviewable.

## Playback and chart

- [ ] **Playback stops silently when the chart redraws outside the store.**
  Hiding the sidebar or calling `chart.redraw()` stops playback with no sound
  or announcement, and the button stays on "Pause". Setting and data changes
  also stop playback without an announcement, though they do reset the button.
  Highcharts rebuilds the sonification timeline on every render.
- [ ] **Highcharts throws a `cache` TypeError after keyboard focus and a
  redraw.** Focus a point with the keyboard, change a setting, then hide the
  sidebar. Highcharts' focus border redraws on a point the redraw has already
  destroyed, and focus drops to `<body>`.
- [ ] **CSV headers are rendered as HTML** in the legend, which triggers
  Highcharts warning #33. Highcharts strips event handlers, so this is not
  exploitable. Series names also feed the tooltip, the accessibility text and
  the settings, so a fix needs to cover all of them.
- [ ] **Equations that name an empty column pick up mathjs constants and
  units.** Filling with `E` gives 2.718, and `F + 1` throws a mathjs unit error
  (`src/app/editor/store/modules/data.ts`, `evaluate`). This needs a decision on
  what an empty column means in an equation.

## Projects and saved state

- [ ] **New Project only resets the data and the series**, although its
  confirm dialog says it resets all settings. The chart title, chart type,
  speed and context cues stay. To change it, also call
  `restoreStoreState()` on the chart parameters and global sonify parameters
  stores in `ProjectMenu.vue`, as the Sidebar's Reset does. This is a product
  decision.
- [ ] **New Project builds the grid twice.** Only one grid remains, but the
  extra hide/show of the chart in `newProject()` (`ProjectMenu.vue`) causes a
  second build. Making it match `importProject()` would fix it.
- [ ] **Loading a project or session restores only the rows and the text
  description.** The data store saves its whole state but drops
  `selectedDataSource` and the Google Sheets settings on restore.
- [ ] **Series settings can move to another column after a save and reload.**
  With an empty middle column, settings made during live editing shift one
  column after a save and reload, and the first grid edit shifts them back.
  This matches master and was kept on purpose. A proper fix needs a
  `storageRevision` bump, and v1.1.1 shares the same origin and localStorage
  key on GitHub Pages, so a bump would clear sessions when people switch
  versions.

## Privacy

- [ ] **The Google API key is saved into project files and the localStorage
  session** (`googleApiKey` in `src/app/editor/store/modules/data.ts`). Anyone
  who gets a shared `.hssp` file also gets the key.

## Accessibility

- [ ] **Focus drops to `<body>`** after:
  - Stop by keyboard (the button becomes disabled);
  - Hide sidebar;
  - Remove context;
  - the first Google Sheets "Next".
- [ ] **PageUp and PageDown in the grid lose focus** once the focused row
  scrolls out of the rendered rows, and focus isn't restored on scrolling back.
- [ ] **The grid's cell editor input has no accessible name.**
- [ ] **The grid column headers' `aria-label="A"`** overrides the visible
  header text.
- [ ] **Ctrl+Home and Ctrl+End do nothing in the grid.**
- [ ] **Inactive "Data series settings" tabs point `aria-controls` at panels
  that aren't rendered.**
- [ ] **The help modal hides the rest of the page with `aria-hidden`** instead
  of using `aria-modal`.
- [ ] **Enter on an info dialog close button emits `close` twice**
  (`SEModalInfo.vue`: the container's keydown and the button's click).
  Harmless, because closing twice does nothing more.

## Release and hosting

- [ ] **Bump the version before the next release.** `npm run release` refuses
  to overwrite the existing `docs/1.1.1/` unless you pass `-- --force`.
- [ ] **Set `VITE_GRID_KEY` for release builds.** Without a Grid Key, Grid Pro
  logs an error on hosts like GitHub Pages; `sonification.highcharts.com` is
  exempt. See the README.
- [ ] **Exported HTML opened from disk may not load Highcharts.** The
  Highcharts CDN refuses requests without a Referer.

## When upstream fixes land

- [ ] **Remove the `aria-rowindex` workaround** in
  `src/app/editor/core/gridProSetup.ts` once Grid Pro numbers screen-reader
  rows by data position again, and stops counting the rows two ways
  (2000 versus 2002 with header rows).

## Code quality (optional)

- [ ] Turn on `verbatimModuleSyntax`: 15 files block it (see the note in
  `tsconfig.json`).
- [ ] Reduce the 37 explicit `any`s in `src/app/editor/core`, then turn on
  `@typescript-eslint/no-explicit-any`.
