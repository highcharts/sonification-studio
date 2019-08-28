/* eslint-disable no-undef */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js'
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};