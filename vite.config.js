import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const uploadsDir = path.resolve(rootDir, 'uploads');

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [rootDir, uploadsDir],
    },
  },
});
