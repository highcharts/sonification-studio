# Highcharts Sonification Studio

Edit data and create charts and sonifications. Developed by Highsoft, the company behind [Highcharts](https://www.highcharts.com). Designed in collaboration with [Georgia Institute of Technology](https://www.gatech.edu/). Read more and see it live at [sonification.highcharts.com](https://sonification.highcharts.com).

## License

This project is licensed under the open source BSD 3-Clause license, but makes use of the proprietary Highcharts library. A suitable [Highcharts license](https://highcharts.com) is required for all commercial use or distribution. This is important if you are making forks or installing the tool on your own servers. See [LICENSE.md](https://github.com/highcharts/sonification-studio/blob/master/LICENSE.md) for more information.

## Develop

Follow the below steps to get started developing on this project.

### Installation

The project requires Node.js 26 or newer (see `.nvmrc`; run `nvm use` if you use nvm). Clone this repository and install dependencies with `npm install`. This also sets up the git pre-commit hook (with [husky](https://typicode.github.io/husky/)), which runs the linter, the type check and the tests before each commit (see `.husky/pre-commit`).

### Build

To start a dev server with hot reloading, run `npm run dev`.

To build for production, run `npm run build`. It runs the type check first, and stops if it fails. The build output is placed in the `dist` directory, with relative asset URLs so it can be served from any subdirectory. Run `npm run preview` to serve the production build locally.

To lint, run `npm run lint`; warnings fail it as well as errors. To type check the TypeScript files and the Vue components, run `npm run typecheck`. Both also run before each commit.

We are using [Vite](https://vite.dev) for the dev server and bundling. The source is written in TypeScript, which Vite transpiles without type checking; [vue-tsc](https://github.com/vuejs/language-tools) does the type checking, configured in `tsconfig.json`. [Vue 3](https://vuejs.org) is used as a front-end framework, with Vue Router and [Pinia](https://pinia.vuejs.org) for state. ESLint is used for linting, with plugins for TypeScript and Vue, configured in `eslint.config.js` (flat config). Vite is configured in `vite.config.ts`. Static files that are copied to the build as-is (favicons, web manifest, `.nojekyll`) are in `/public`, and the HTML entry point is `/index.html`.

### Publish

To build and publish to GitHub pages, ensure app version is correct in `package.json`, run `npm run publish`, commit, and push. Commit message should be `Release vX.X.X.`. After pushing, add a new release on GitHub, with a tag corresponding to the release version (`vX.X.X`), and name corresponding to the version number (`X.X.X`).

`npm run publish` runs the linter and the tests, builds the app (type check, then minified, without source maps) and runs `scripts/publish.mjs`, which replaces `docs/<version>` with the contents of `dist`, copies the studies to `docs/<version>/studies`, and copies the project landing page from `src/project_lander` to `docs`.

If publishing on other platforms than GitHub, remove the `.nojekyll` files, and ensure index pages are named correctly (`index.html` vs `home.html`).

The contents of the `docs` directory is automatically served on the [GitHub pages site](https://highcharts.github.io/sonification-studio/). The app releases are versioned in `docs` in order to allow for user testing different versions, and avoiding confusion around which version is being tested.

### Tests

To run unit tests, run `npm test`.

[Vitest](https://vitest.dev) is used as the test framework, with Vue Test Utils for component tests. The tests can be found under `/test`.

Tests are run automatically before each commit.

### Studies

Studies are stored under `/src/app/studies`, and are copied to `/docs/<version>/studies` with their original directory structure upon publishing.

These studies are used for publishing demos around research efforts from Highcharts related to sonification.

### Source files

Source files are found under `/src/app`, with `/src/app/public/app.ts` as the entry point, `/src/app/editor` containing components for the editor itself, and `/src/app/home` containing components for the landing page. `/src/app/editor/core` contains the program logic and utilities, and `/src/app/editor/store` contains the Pinia stores (`modules/`, one per area, with default parameters) and the app state module (`store.ts`), which gathers the state of all stores for localStorage sessions and project files, and restores it.

### Notable dependencies

The project has a dependency on the open source JavaScript library [mathJS](https://mathjs.org) (version 15). Its expression parser (`evaluate`) is used for the "Fill column from equation" tool under "Grid tools" on the data page.

The data grid is [Highcharts Grid Pro](https://www.highcharts.com/products/grid/) (`src/app/editor/components/Grid.vue`, with its options and data handling in `src/app/editor/core/utils/gridData.ts`, and an edit renderer it adds to Grid Pro in `src/app/editor/core/gridProSetup.ts`). Grid Pro 3 checks for a [Grid Key](https://www.highcharts.com/docs/grid/grid-key) on pages outside highcharts.com: without one it logs a warning on localhost and an error elsewhere, for example on the GitHub Pages site. No key is committed to this repository. To build with one, set it in the `VITE_GRID_KEY` environment variable, either for one command (`VITE_GRID_KEY=... npm run build`, or the same with `npm run publish`) or in a `.env.local` file in the project root (`VITE_GRID_KEY=...`), which git ignores. Vite reads it at build time and puts it in the bundle.
