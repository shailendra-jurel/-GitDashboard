import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendUrl = import.meta.VITE_BACKEND_URL || 'http://localhost:5000';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [  tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: backendUrl, // Your backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
