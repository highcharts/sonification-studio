import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default defineConfig(
    // Like ESLint 6 before, also skip dotfiles and dot-directories
    // (e.g. .worktrees/).
    globalIgnores(['dist/', 'docs/', 'vendor/', '**/.*']),
    {
        files: ['**/*.{js,mjs,ts,vue}']
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    pluginVue.configs['flat/recommended'],
    {
        // All SFCs use <script lang="ts">: parse them with the TypeScript
        // parser and, as for .ts files, turn off the core rules TypeScript
        // already checks (e.g. no-undef, which misreads type references).
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser
            }
        },
        rules: tseslint.configs.eslintRecommended.rules
    },
    {
        languageOptions: {
            globals: globals.browser
        },
        rules: {
            // Core formatting rules are deprecated, but available until ESLint 11
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-trailing-spaces': ['error'],
            'no-multi-spaces': ['error'],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            'vue/html-indent': ['error', 4],
            // Single-word component names (Header, Grid, Preview, ...) are
            // used throughout the app.
            'vue/multi-word-component-names': 'off'
        }
    },
    {
        // Config and build scripts run in Node
        files: ['*.config.{js,ts}', 'scripts/**/*.mjs'],
        languageOptions: {
            globals: globals.node
        }
    }
);
