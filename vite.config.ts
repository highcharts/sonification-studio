/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The app is served from versioned subdirectories on GitHub Pages
// (docs/<version>/), so all asset URLs in the build are relative.
export default defineConfig({
    base: './',
    plugins: [vue({
        // Keep the whitespace between elements, as the Vue 2 build did.
        // Vue 3's default ('condense') drops it where it holds a line break,
        // which moves inline elements together (e.g. the logo and the title
        // in SEModalInfo's header).
        template: { compilerOptions: { whitespace: 'preserve' } }
    })],
    optimizeDeps: {
        // Only scan the app's entry point for dependencies to pre-bundle.
        // By default the dev server scans every HTML file in the project,
        // including each published version's docs/*/index.html.
        entries: ['index.html']
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        // The app ships as a single bundle, including Highcharts and Grid Pro
        chunkSizeWarningLimit: 2500
    },
    test: {
        environment: 'jsdom',
        include: ['test/**/*.test.ts']
    }
});
