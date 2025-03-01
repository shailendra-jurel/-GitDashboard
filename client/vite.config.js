import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// Properly access environment variables in Vite
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';
// const backendUrl =  'http://localhost:5000';

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
  
})
