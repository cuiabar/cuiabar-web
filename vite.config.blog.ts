import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, 'blog-app'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    outDir: path.resolve(__dirname, 'dist-blog'),
    emptyOutDir: true,
  },
});
