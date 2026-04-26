import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendPort = process.env.SERVER_PORT || process.env.BACKEND_PORT || 4000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Make sure environment variables are available
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || ''),
  },
});
