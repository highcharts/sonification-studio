# Sonification Explorer

Edit data and create charts that play sound. Developed by [Highcharts](https://www.highcharts.com). Designed in collaboration with [Georgia Institute of Technology](https://www.gatech.edu/).

## License

This project is MIT licensed, but makes use of the proprietary Highcharts library. A [Highcharts license](https://highcharts.com) is required for commercial use.

## Develop

Follow the below steps to get started developing on this project.

### Installation

Clone this repository and install dependencies with `npm i`.

### Build

To build the project and start a dev server, run `npm run dev`.

To build for production, run `npm run build`. The build output is placed in the `dist` directory.

To lint without building, run `npm run lint`. Linting is otherwise ran automatically before each build and commit.

We are using ParcelJS for bundling files. Typescript is used for transpilation, and Vue is used as a front-end
framework. Eslint is used for linting, with plugins for Typescript and Vue. 

### Publish

To build and publish to GitHub pages, set the app version in `package.json`, run `npm run publish`, commit, and push. Commit message should be `Release vX.X.X.`. After pushing, add a new release on GitHub, with a tag corresponding to the release version.

The contents of the `docs` directory is served on the GitHub pages site. The app releases are versioned in `docs` in order to allow for user testing different versions, and avoiding confusion around which version is being tested.


### Tests

To run unit tests, run `npm test`.

Jest is used as the test framework. The tests can be found under `/test`.

Tests are ran automatically before each commit.

### Source files

Source files are found under `/src`, with `/src/app` containing all front end components, and
`/src/core` containing the program logic and utilities.
