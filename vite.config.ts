/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The app is served from versioned subdirectories on GitHub Pages
// (docs/<version>/), so all asset URLs in the build are relative.
export default defineConfig({
    base: './',
    plugins: [vue()],
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
