import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@repo/gridkit-react': resolve('lib/gridkit/react/index.js'),
        '@repo/gridkit-core': resolve('lib/gridkit/core/core.js'),
        '@repo/gridkit-vanilla': resolve('lib/gridkit/vanilla/index.js'),
        '@repo/gridkit-charts': resolve('lib/gridkit/charts/index.js'),
        '@repo/types': resolve('lib/gridkit/types/index.js'),
      },
    },
  },
});
