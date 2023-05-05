# Highcharts Sonification Studio

Edit data and create charts and sonifications. Developed by Highsoft, the company behind [Highcharts](https://www.highcharts.com). Designed in collaboration with [Georgia Institute of Technology](https://www.gatech.edu/). Read more and see it live at [sonification.highcharts.com](https://sonification.highcharts.com).

## License

This project is licensed under the open source BSD 3-Clause license, but makes use of the proprietary Highcharts library. A suitable [Highcharts license](https://highcharts.com) is required for all commercial use or distribution. This is important if you are making forks or installing the tool on your own servers. See [LICENSE.md](https://github.com/highcharts/sonification-studio/blob/master/LICENSE.md) for more information.

## Develop

Follow the below steps to get started developing on this project.

### Installation

Clone this repository and install dependencies with `npm i`.

### Build

To build the project and start a dev server, run `npm run dev`.

To build for production, run `npm run build`. The build output is placed in the `dist` directory.

To lint without building, run `npm run lint`. Linting is otherwise ran automatically before each build and commit.

We are using ParcelJS for bundling files. Typescript is used for transpilation, and Vue is used as a front-end framework. Eslint is used for linting, with plugins for Typescript and Vue. 

### Publish

To build and publish to GitHub pages, ensure app version is correct in `package.json`, run `npm run publish`, commit, and push. Commit message should be `Release vX.X.X.`. After pushing, add a new release on GitHub, with a tag corresponding to the release version (`vX.X.X`), and name corresponding to the version number (`X.X.X`).

If publishing on other platforms than GitHub, remove the `.nojekyll` files, and ensure index pages are named correctly (`index.html` vs `home.html`).

The contents of the `docs` directory is automatically served on the [GitHub pages site](https://highcharts.github.io/sonification-studio/). The app releases are versioned in `docs` in order to allow for user testing different versions, and avoiding confusion around which version is being tested.

### Tests

To run unit tests, run `npm test`.

Jest is used as the test framework. The tests can be found under `/test`.

Tests are ran automatically before each commit.

### Studies

Studies are stored under `/src/app/studies`, and are copied to `/docs/studies` with their original directory structure upon building/publishing.

These studies are used for publishing demos around research efforts from Highcharts related to sonification.

### Source files

Source files are found under `/src/app`, with `/src/app/editor` containing components for the editor itself, and `/src/app/home` containing components for the landing page. `/src/editor/core` contains the program logic and utilities, and `/src/editor/store` contains the Vuex data store modules with default parameters.

### Notable dependencies

The project has a dependency on the open source Javacsript library [mathJS](https://mathjs.org). This library is used for the "Fill equation" functionality on the data page.
