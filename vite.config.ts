import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
    base: '/swanandwebsite/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://stagingswanand.oryxretail.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
