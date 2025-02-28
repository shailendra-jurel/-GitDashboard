import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Properly access environment variables in Vite
const backendUrl = process.env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Make environment variables available
  define: {
    'process.env': process.env
  }
})
