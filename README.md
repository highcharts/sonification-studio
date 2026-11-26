# Highcharts Sonification Studio

Edit data and create charts and sonifications. Developed by Highsoft, the company behind [Highcharts](https://www.highcharts.com). Designed in collaboration with [Georgia Institute of Technology](https://www.gatech.edu/). Read more and see it live at [sonification.highcharts.com](https://sonification.highcharts.com).

## License

This project is licensed under the open source BSD 3-Clause license, but makes use of the proprietary Highcharts library. A suitable [Highcharts license](https://highcharts.com) is required for all commercial use or distribution. This is important if you are making forks or installing the tool on your own servers. See [LICENSE.md](https://github.com/highcharts/sonification-studio/blob/master/LICENSE.md) for more information.

## Develop

Follow the below steps to get started developing on this project.

### Installation

The project requires Node.js 26 or newer (`engines` in `package.json`; `.nvmrc` holds `26`, so run `nvm use` if you use nvm). Clone this repository and install dependencies with `npm install`, or `npm ci` for a clean install of the exact versions in `package-lock.json`. Both also run the `prepare` script, which sets up the git pre-commit hook (with [husky](https://typicode.github.io/husky/)). The hook (`.husky/pre-commit`) runs the linter, the type check and the tests before each commit, and stops the commit if one of them fails.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server, with hot module replacement, at http://localhost:5173/ |
| `npm run build` | Runs the type check, then (if it passes) builds for production into `dist` |
| `npm run preview` | Serves the production build in `dist` at http://localhost:4173/ (run `npm run build` first) |
| `npm test` | Runs the unit tests once with Vitest |
| `npm run lint` | Lints the project with ESLint; warnings fail it as well as errors |
| `npm run typecheck` | Type checks the TypeScript files and the Vue components with vue-tsc |
| `npm run release` | Release step: lints, tests, builds and copies the build into `docs` (see [Publish](#publish)) |
| `prepare` | Run by npm after `npm install` and `npm ci`: sets up the husky git hooks |

### Build

To start a dev server with hot reloading, run `npm run dev`, and open http://localhost:5173/ (Vite's default port; if it is taken, Vite takes the next free one and prints the URL). The app uses hash routing: the editor is at `#/app` and the tutorial at `#/tutorial`. In development, the editor always starts with the placeholder data, instead of restoring the previous session from localStorage as the production build does.

To build for production, run `npm run build`. It runs the type check first, and stops if it fails. The build output (minified, without source maps) is placed in the `dist` directory, with relative asset URLs so it can be served from any subdirectory. Run `npm run preview` to serve the production build locally.

To lint, run `npm run lint`; warnings fail it as well as errors. To type check the TypeScript files and the Vue components, run `npm run typecheck`. Both also run before each commit.

We are using [Vite](https://vite.dev) (version 8) for the dev server and bundling, configured in `vite.config.ts`. The source is written in TypeScript (6.0), which Vite transpiles without type checking; [vue-tsc](https://github.com/vuejs/language-tools) does the type checking, configured in `tsconfig.json` (one project for the app, the tests and `vite.config.ts`). [Vue](https://vuejs.org) 3.5 is used as a front-end framework, with [Vue Router](https://router.vuejs.org) (version 5, with hash history, so the app works on GitHub Pages without server-side routing) and [Pinia](https://pinia.vuejs.org) for state. The components are single-file components with `<script lang="ts">` (the linter requires it, so the type check covers all of them) and Less styles. ESLint is used for linting, with plugins for TypeScript (typescript-eslint) and Vue (eslint-plugin-vue), configured in `eslint.config.js` (flat config). Static files that are copied to the build as-is (favicons, web manifest, `.nojekyll`) are in `/public`, and the HTML entry point is `/index.html`.

### Publish

To build and publish to GitHub pages, ensure app version is correct in `package.json`, run `npm run release`, commit, and push. Commit message should be `Release vX.X.X.`. After pushing, add a new release on GitHub, with a tag corresponding to the release version (`vX.X.X`), and name corresponding to the version number (`X.X.X`).

`npm run release` runs the linter and the tests, builds the app (type check, then minified, without source maps) and runs `scripts/publish.mjs`, which replaces `docs/<version>` with the contents of `dist`, copies the studies to `docs/<version>/studies`, and copies the project landing page from `src/project_lander` to `docs`. `<version>` is the current version in `package.json`, so only run it as a manual release step, after bumping the version: with the version of an earlier release, it overwrites that release in `docs`.

The release script is `npm run release`, not `npm publish`: the app is not an npm package, and `"private": true` in `package.json` makes npm refuse to publish it to the npm registry.

If publishing on other platforms than GitHub, remove the `.nojekyll` files.

The contents of the `docs` directory is automatically served on the [GitHub pages site](https://highcharts.github.io/sonification-studio/). The app releases are versioned in `docs` in order to allow for user testing different versions, and avoiding confusion around which version is being tested.

### Tests

To run unit tests, run `npm test`.

[Vitest](https://vitest.dev) is used as the test framework, with [Vue Test Utils](https://test-utils.vuejs.org) for component tests, in a jsdom environment (configured under `test` in `vite.config.ts`). The tests can be found under `/test` (`*.test.ts`), and `/test/fixtures` holds a project file and a localStorage session saved with version 1.1.1, to test that they still load.

Tests are run automatically before each commit.

### Studies

Studies are stored under `/src/app/studies`, and are copied to `/docs/<version>/studies` with their original directory structure upon publishing. They are standalone pages with their own Highcharts bundles: they are not part of the Vite build, and the linter skips them.

These studies are used for publishing demos around research efforts from Highcharts related to sonification.

### Source files

Source files are found under `/src/app`, with `/src/app/public/app.ts` as the entry point (it sets up the router, the Pinia stores and the app-wide `$chartBridge` and `$announcer`), `/src/app/editor` containing components for the editor itself, and `/src/app/home` containing components for the landing page. `/src/app/editor/core` contains the program logic and utilities, and `/src/app/editor/store` contains the Pinia stores (`modules/`, one per area, with default parameters) and the app state module (`store.ts`), which gathers the state of all stores for localStorage sessions and project files, and restores it. `/src/env.d.ts` declares the app's global types (the `$chartBridge` and `$announcer` component properties, the route `meta` and the `VITE_` environment variables). `/src/project_lander` is the landing page at the root of the GitHub Pages site, which points visitors to the versioned subdirectories.

### Notable dependencies

The charts are rendered with [Highcharts](https://www.highcharts.com) (version 13), with its sonification and accessibility modules among others (loaded in `src/app/editor/core/highchartsSetup.ts`), through [highcharts-vue](https://github.com/highcharts/highcharts-vue) (version 2) in `src/app/editor/components/Preview.vue`.

The project has a dependency on the open source JavaScript library [mathJS](https://mathjs.org) (version 15). Its expression parser (`evaluate`) is used for the "Fill column from equation" tool under "Grid tools" on the data page.

Project files are compressed with [lz-string](https://github.com/pieroxy/lz-string) (`src/app/editor/core/utils/projectFileHandling.ts`).

The data grid is [Highcharts Grid Pro](https://www.highcharts.com/products/grid/) (version 3; `src/app/editor/components/Grid.vue`, with its options and data handling in `src/app/editor/core/utils/gridData.ts`, and additions to Grid Pro in `src/app/editor/core/gridProSetup.ts`: an edit renderer that lets a cleared number cell stay empty, and a workaround for Grid Pro 3.2.0 numbering the rows by their position on screen in `aria-rowindex` after a scroll, to remove once Grid Pro is fixed). Grid Pro 3 checks for a [Grid Key](https://www.highcharts.com/docs/grid/grid-key) on pages outside highcharts.com: without one it logs a warning on localhost and an error elsewhere, for example on the GitHub Pages site. No key is committed to this repository. To build with one, set it in the `VITE_GRID_KEY` environment variable, either for one command (`VITE_GRID_KEY=... npm run build`, or the same with `npm run release`) or in a `.env.local` file in the project root (`VITE_GRID_KEY=...`), which git ignores. Vite reads it at build time and puts it in the bundle.
