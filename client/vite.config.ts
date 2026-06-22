import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendPort = process.env.SERVER_PORT || process.env.PORT || '5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      '/api': `http://localhost:${backendPort}`
    }
  }
});
