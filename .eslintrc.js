/* global module */
module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/recommended'
    ],
    globals: {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    parser: 'vue-eslint-parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-trailing-spaces': ['error'],
        'no-multi-spaces': ['error'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        'vue/html-indent': ['error', 4]
    }
};