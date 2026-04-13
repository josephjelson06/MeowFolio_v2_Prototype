import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
var rootDir = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
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
});
