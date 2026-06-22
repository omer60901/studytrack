import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { InlineConfig } from 'vitest';
import type { UserConfig } from 'vite';

interface VitestWorkspaceConfig extends UserConfig {
  test?: InlineConfig;
}

export default defineConfig({
  plugins: [react()],
  // הגדרות השרת והפרוקסי עבור ה-Backend
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // הגדרות הטסטים
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.ts',
  },
} as VitestWorkspaceConfig);