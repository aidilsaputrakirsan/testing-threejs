// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@js': resolve(__dirname, './src/js'),
      '@data': resolve(__dirname, './src/data'),
      '@assets': resolve(__dirname, './public/assets')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    host: true,
    open: true
  }
});