# Sonification Explorer

Edit data and create charts that play sound. Developed by [Highcharts](https://www.highcharts.com).

## Develop

Follow the below steps to get started developing on this project.

### Installation

Clone this repository and install dependencies with `npm i`.

### Build

To build the project and start a dev server, run `npm run dev`.

To build for production, run `npm run build`. The build output is placed in the `dist` directory.

To lint without building, run `npm run lint`. Linting is otherwise ran automatically before each build.

We are using ParcelJS for bundling files. Typescript is used for transpilation, and Vue is used as a front-end
framework. Eslint is used for linting, with plugins for Typescript and Vue. 

### Tests

To run unit tests, run `npm test`.

Jest is used as the test framework. The tests can be found under `/test`.

### Source files

Source files are found under `/src`, with `/src/app` containing all front end components, and
`/src/core` containing the program logic and utilities.
