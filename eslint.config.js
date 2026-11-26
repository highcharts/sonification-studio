import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default defineConfig(
    globalIgnores([
        'dist/',
        'docs/',
        'vendor/',
        // Standalone study pages with vendored Highcharts bundles
        'src/app/studies/',
        // Like ESLint 6 before, also skip dotfiles and dot-directories
        // (e.g. .worktrees/).
        '**/.*'
    ]),
    {
        files: ['**/*.{js,mjs,ts,vue}']
    },
    js.configs.recommended,
    // Parses all files (including .js) with the TypeScript parser
    tseslint.configs.recommended,
    // Vue 3 rules; parses .vue files with vue-eslint-parser
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
        rules: {
            ...tseslint.configs.eslintRecommended.rules,
            // Keep every SFC in the type check (vue-tsc)
            'vue/block-lang': ['error', { script: { lang: 'ts' } }]
        }
    },
    {
        rules: {
            // Core formatting rules are deprecated, but available until ESLint 11
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-trailing-spaces': ['error'],
            'no-multi-spaces': ['error'],
            // The chart code in src/app/editor/core still has 37 explicit
            // `any`s (generic option objects, mapping table lookups,
            // Highcharts internals): utils/objects.ts (16, including
            // GenericObject), ChartBridge.ts (11), the option mappers (5),
            // utils/chartUtils.ts (4) and defaultChartOptions.ts (1). The
            // stores and components have none; test/core/utils/objects.test.ts
            // has 3.
            '@typescript-eslint/no-explicit-any': 'off',
            // A few callbacks alias `this` (the component or ChartBridge)
            // because Highcharts or a named function rebinds `this` inside.
            '@typescript-eslint/no-this-alias': 'off',
            'vue/html-indent': ['error', 4],
            // Single-word component names (Header, Grid, Preview, ...) are
            // used throughout the app.
            'vue/multi-word-component-names': 'off'
        }
    },
    {
        // The app and its tests (Vitest runs them in jsdom)
        files: ['src/**', 'test/**'],
        languageOptions: {
            globals: globals.browser
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
