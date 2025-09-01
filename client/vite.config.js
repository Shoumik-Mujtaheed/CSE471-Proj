// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist' // This should match Vercel's Output Directory setting
  },
  server: {
    proxy: {
      // Proxy API requests starting with /api to your backend server:
      '/api': 'http://localhost:5000',
    },
  },
});