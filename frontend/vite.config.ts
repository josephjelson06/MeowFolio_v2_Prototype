import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// ---------------------------------------------------------------------------
// Dev API proxy
// In production, /api/* is handled by Vercel serverless functions.
// In local dev (npm run dev), Vite has no runtime for those functions, so we
// proxy the requests to the deployed Vercel preview/production URL so that
// AI parsing works without needing a local server.
// ---------------------------------------------------------------------------
const VERCEL_API_TARGET = 'https://meowfolio-v2.vercel.app';

export default defineConfig({
  envDir: '../',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      app: path.resolve(rootDir, 'src/app'),
      components: path.resolve(rootDir, 'src/components'),
      hooks: path.resolve(rootDir, 'src/hooks'),
      layouts: path.resolve(rootDir, 'src/layouts'),
      lib: path.resolve(rootDir, 'src/lib'),
      mocks: path.resolve(rootDir, 'src/mocks'),
      modals: path.resolve(rootDir, 'src/modals'),
      pages: path.resolve(rootDir, 'src/pages'),
      services: path.resolve(rootDir, 'src/services'),
      state: path.resolve(rootDir, 'src/state'),
      styles: path.resolve(rootDir, 'src/styles'),
      types: path.resolve(rootDir, 'src/types'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: VERCEL_API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
