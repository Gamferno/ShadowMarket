import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    react(),
    wasm()
  ],
  define: {
    'global': 'globalThis'
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['@midnight-ntwrk/onchain-runtime-v3'],
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
