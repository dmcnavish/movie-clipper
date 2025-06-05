import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
     port: 3000,
    logLevel: 'info',
    proxy: {
      '/api': 'http://localhost:4000',
      '/clips': 'http://localhost:4000', // optional: if you want to fetch clips from frontend
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
});